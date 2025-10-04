import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p>Email: {session.user?.email}</p>
      <p>Name: {session.user?.name}</p>
    </div>
  );
}