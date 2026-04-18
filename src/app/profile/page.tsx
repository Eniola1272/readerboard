import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import User, { IUser } from '@/lib/db/models/User';
import { Book } from '@/lib/db/models/Book';
import { Progress } from '@/lib/db/models/Progress';
import Link from 'next/link';
import Image from 'next/image';

interface UserProfile extends Omit<IUser, 'password'> {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  pagesRead: number;
  booksCompleted: number;
}

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

interface Activity {
  _id: string;
  pagesRead: number;
  lastReadDate: string | number | Date;
  completed: boolean;
}

async function getUserProfile(userId: string): Promise<UserProfileData> {
  await connectDB();

  const userDoc = await User.findById(userId).select('-password').lean();

  if (!userDoc) {
    throw new Error("User not found in DB");
  }

  const booksUploadedCount = await Book.find({ uploadedBy: userId }).countDocuments();
  const progressDocs = await Progress.find({ userId }).lean();

  const totalPagesRead = userDoc.pagesRead || 0;
  const booksCompleted = userDoc.booksCompleted || 0;
  const currentlyReading = progressDocs.filter((p) => !p.completed).length;

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
    profileData = await getUserProfile(session.user.id);
  } catch (e) {
    console.error(e);
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-brand-500">Failed to load profile data.</p>
      </div>
    );
  }

  const { user, stats, recentActivity } = profileData;

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-brand-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-card shadow-soft border border-brand-200 p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full ring-4 ring-brand-200"
                  width={96}
                  height={96}
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center ring-4 ring-brand-200 shadow-glow">
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
                  <h1 className="text-3xl text-brand-950">{user.name}</h1>
                  {user.username && (
                    <p className="text-brand-500 mt-1 font-medium">@{user.username}</p>
                  )}
                  <p className="text-sm text-brand-400 mt-0.5">{user.email}</p>
                </div>
                <Link
                  href="/profile/edit"
                  className="px-4 py-2 bg-brand-100 text-brand-700 rounded-pill hover:bg-brand-200 text-sm font-medium transition-colors"
                >
                  Edit Profile
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <div className="text-center p-3 bg-brand-50 rounded-card border border-brand-200">
                  <div className="text-2xl font-bold text-brand-600" style={{ fontFamily: 'Instrument Serif, serif' }}>
                    {stats.totalPagesRead.toLocaleString()}
                  </div>
                  <div className="text-xs text-brand-500 mt-1">Pages Read</div>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-card border border-emerald-100">
                  <div className="text-2xl font-bold text-emerald-600" style={{ fontFamily: 'Instrument Serif, serif' }}>
                    {stats.booksCompleted}
                  </div>
                  <div className="text-xs text-brand-500 mt-1">Books Done</div>
                </div>
                <div className="text-center p-3 bg-brand-100 rounded-card border border-brand-200">
                  <div className="text-2xl font-bold text-brand-500" style={{ fontFamily: 'Instrument Serif, serif' }}>
                    {stats.currentlyReading}
                  </div>
                  <div className="text-xs text-brand-500 mt-1">Reading Now</div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-card border border-amber-100">
                  <div className="text-2xl font-bold text-amber-600" style={{ fontFamily: 'Instrument Serif, serif' }}>
                    {stats.booksUploaded}
                  </div>
                  <div className="text-xs text-brand-500 mt-1">Uploaded</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reading Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Progress Overview */}
          <div className="bg-white rounded-card shadow-soft border border-brand-200 p-6">
            <h2 className="text-lg text-brand-950 mb-4">Reading Progress</h2>

            {stats.totalPagesRead === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-brand-500 text-sm">Start reading to see your progress!</p>
                <Link
                  href="/library"
                  className="inline-block mt-4 px-4 py-2 bg-brand-600 text-white rounded-pill hover:bg-brand-700 text-sm font-medium"
                >
                  Go to Library
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-brand-100">
                  <span className="text-sm text-brand-500">Avg. pages/day (30d)</span>
                  <span className="text-lg font-semibold text-brand-950">
                    {Math.round(stats.totalPagesRead / 30)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-brand-500">Completion rate</span>
                  <span className="text-lg font-semibold text-brand-950">
                    {stats.booksUploaded > 0
                      ? `${Math.round((stats.booksCompleted / stats.booksUploaded) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Leaderboard Position */}
          <div className="bg-white rounded-card shadow-soft border border-brand-200 p-6">
            <h2 className="text-lg text-brand-950 mb-4">Leaderboard Rank</h2>
            <div className="text-center py-4">
              <div className="text-4xl gradient-text mb-2" style={{ fontFamily: 'Instrument Serif, serif' }}>#—</div>
              <p className="text-sm text-brand-500">Read more to climb the ranks!</p>
              <Link
                href="/leaderboard"
                className="inline-block mt-4 px-5 py-2 bg-brand-100 text-brand-700 rounded-pill hover:bg-brand-200 text-sm font-medium transition-colors"
              >
                View Leaderboard →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-card shadow-soft border border-brand-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg text-brand-950">Recent Activity</h2>
            <Link href="/library" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View All →
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-brand-500 text-sm">No reading activity yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-center justify-between p-3 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-950">
                        {activity.pagesRead} pages read
                      </p>
                      <p className="text-xs text-brand-400">
                        {new Date(activity.lastReadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      activity.completed
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-brand-100 text-brand-700'
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
