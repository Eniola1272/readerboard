import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import { Book } from '@/lib/db/models/Book';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

async function deleteFile(publicPath: string) {
  if (!publicPath || publicPath === '/book-placeholder.png') return;
  const abs = join(process.cwd(), 'public', publicPath);
  if (existsSync(abs)) await unlink(abs).catch(() => {});
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

  // Delete files from disk
  await deleteFile(book.fileUrl);
  await deleteFile(book.thumbnail);

  await book.deleteOne();
  return NextResponse.json({ success: true });
}
