import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import EditProfileForm from '@/components/profile/EditProfileForm';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

async function getUser(userId: string) {
  await connectDB();
  const user = await User.findById(userId).select('-password').lean();
  return JSON.parse(JSON.stringify(user));
}

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const user = await getUser(session.user.id);

  return (
    <div className="min-h-screen bg-surface py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-brand-950">Edit Profile</h1>
          <p className="text-gray-500 mt-2">Update your personal information</p>
        </div>

        <EditProfileForm user={user} />
      </div>
    </div>
  );
}
