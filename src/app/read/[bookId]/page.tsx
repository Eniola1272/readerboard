import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import { Book } from '@/lib/models/Book';
import { Progress } from '@/lib/models/Progress';
import PDFReaderClient from '@/components/PDFReaderClient';

async function getBookAndProgress(bookId: string, userId: string) {
  try {
    await connectDB();
    
    const book = await Book.findById(bookId).lean();
    if (!book) return null;

    const progress = await Progress.findOne({ userId, bookId }).lean();

    return {
      book: JSON.parse(JSON.stringify(book)),
      progress: progress ? JSON.parse(JSON.stringify(progress)) : null,
    };
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
}

export default async function ReadPage({ params }: { params: { bookId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const data = await getBookAndProgress(params.bookId, session.user.id);

  if (!data) {
    redirect('/library');
  }

  return (
    <PDFReaderClient
      fileUrl={data.book.fileUrl}
      bookId={params.bookId}
      userId={session.user.id}
      initialPage={data.progress?.currentPage || 1}
      totalPages={data.book.totalPages}
      bookTitle={data.book.title}
    />
  );
}