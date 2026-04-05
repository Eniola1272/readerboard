import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import User, { IUser } from '@/lib/db/models/User'; // Assuming IUser is exported from your User model
import { Book } from '@/lib/db/models/Book';
import { Progress } from '@/lib/db/models/Progress'; // Assuming IProgress is exported
import Link from 'next/link';
import Image from 'next/image';

// --- Interface Definitions ---

// Define the shape of the user object retrieved from the database (excluding password)
// Note: Assuming 'User' model returns a plain object after .lean() and JSON.parse
interface UserProfile extends Omit<IUser, 'password'> {
  _id: string; // Add required fields not explicitly defined in IUser
  name: string;
  username: string;
  email: string;
  avatar?: string;
  pagesRead: number;
  booksCompleted: number;
}

// Define the shape of the data returned by the main fetch function
interface UserProfileData {
  user: UserProfile;
  stats: {
    totalPagesRead: number;
    booksCompleted: number;
    booksUploaded: number;
    currentlyReading: number;
  };
  recentActivity: Activity[];
}

// Define the shape for Recent Activity items (based on IProgress/Progress model)
interface Activity {
  _id: string;
  pagesRead: number;
  lastReadDate: string | number | Date;
  completed: boolean;
  // You might need to add bookId, title, etc., if Progress has those fields
}


async function getUserProfile(userId: string): Promise<UserProfileData> {
  await connectDB();
  
  // NOTE: Use .select() to potentially improve performance/security by limiting fields.
  const userDoc = await User.findById(userId).select('-password').lean(); 
  
  if (!userDoc) {
      // Throw an error or return a specific structure if the user is not found
      // This helps guarantee 'user' is present if the function succeeds.
      throw new Error("User not found in DB");
  }

  // Find books uploaded by user (count)
  const booksUploadedCount = await Book.find({ uploadedBy: userId }).countDocuments();
  
  // Find all progress documents for the user
    const progressDocs = await Progress.find({ userId }).lean();
    
    // Calculate reading stats
    const totalPagesRead = userDoc.pagesRead || 0;
    const booksCompleted = userDoc.booksCompleted || 0;
    const currentlyReading = progressDocs.filter((p) => !p.completed).length; 
    
    // Mongoose documents need to be converted to plain objects for Next.js serialization
    const serializedUser = JSON.parse(JSON.stringify(userDoc));
    const serializedProgress = JSON.parse(JSON.stringify(progressDocs.slice(0, 5)));

  return {
    user: serializedUser as UserProfile,
    stats: {
      totalPagesRead,
      booksCompleted,
      booksUploaded: booksUploadedCount,
      currentlyReading,
    },
    recentActivity: serializedProgress as Activity[],
  };
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  let profileData: UserProfileData;
  try {
    // 1. FIX: The return value is correctly typed as UserProfileData
    profileData = await getUserProfile(session.user.id);
  } catch (e) {
    console.error(e);
    return <div>Failed to load profile data.</div>;
  }
  
  // Destructure from the typed object
  const { user, stats, recentActivity } = profileData;

  // Since getUserProfile throws if no user is found, this is a safety net
  // but if the function works, 'user' will be defined.
  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full ring-4 ring-blue-100"
                  width={96}
                  height={96}
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center ring-4 ring-blue-100">
                  <span className="text-white text-3xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  {/* Safely display username if it exists */}
                  {user.username && <p className="text-gray-600 mt-1">@{user.username}</p>}
                  <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                </div>
                <Link
                  href="/profile/edit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Edit Profile
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalPagesRead.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Pages Read</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.booksCompleted}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Books Done</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.currentlyReading}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Reading Now</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.booksUploaded}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Uploaded</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reading Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Progress Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reading Progress</h2>
            
            {stats.totalPagesRead === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <p className="text-gray-600 mt-2">Start reading to see your progress!</p>
                <Link
                  href="/library"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Go to Library
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average pages/day (estimate)</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {/* NOTE: Calculating average pages/day over a fixed 30 days might be misleading. 
                       It's better to calculate based on the user's join date or use a more accurate metric. */}
                    {Math.round(stats.totalPagesRead / 30)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion rate</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {stats.booksUploaded > 0
                      ? `${Math.round((stats.booksCompleted / stats.booksUploaded) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Leaderboard Position */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Leaderboard Rank</h2>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                #—
              </div>
              <p className="text-sm text-gray-600">
                Read more to climb the ranks!
              </p>
              <Link
                href="/leaderboard"
                className="inline-block mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link href="/library" className="text-sm text-blue-600 hover:text-blue-700">
              View All →
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No reading activity yet</p>
            </div>
          ) : (
            // 3. FIX: Removed inline interface declaration and constant assignment from JSX return
            <div className="space-y-3">
              {/* recentActivity is already typed as Activity[], so no further casting needed */}
              {recentActivity.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.pagesRead} pages read
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.lastReadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      activity.completed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {activity.completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}