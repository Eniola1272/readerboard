import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import { Book } from '@/lib/db/models/Book';
import { del } from '@vercel/blob';

function isBlobUrl(url: string) {
  return url?.startsWith('https://') && url.includes('blob.vercel-storage.com');
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { bookId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const book = await Book.findById(params.bookId);

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  if (String(book.uploadedBy) !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Delete blobs (only URLs stored in Vercel Blob — skip local/placeholder paths)
  const toDelete = [book.fileUrl, book.thumbnail].filter(isBlobUrl);
  if (toDelete.length) await del(toDelete);

  await book.deleteOne();
  return NextResponse.json({ success: true });
}
