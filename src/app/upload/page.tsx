import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import UploadForm from '@/components/UploadForm';

export default async function UploadPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl text-brand-950">Upload a Book</h1>
          <p className="text-brand-500 mt-2">Add a new book to your reading library</p>
        </div>
        <UploadForm />
      </div>
    </div>
  );
}
