import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import { Book } from '@/lib/db/models/Book';
import { put } from '@vercel/blob';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData  = await req.formData();
    const file      = formData.get('file')      as File;
    const title     = formData.get('title')     as string;
    const author    = (formData.get('author')   as string) || 'Unknown';
    const totalPages = parseInt(formData.get('totalPages') as string) || 0;
    const thumbFile = formData.get('thumbnail') as File | null;

    if (!file || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size must be under 50MB' }, { status: 400 });
    }

    // Upload PDF to Vercel Blob
    const safeName = file.name.replace(/\s+/g, '-');
    const pdfBlob  = await put(`books/${Date.now()}-${safeName}`, file, { access: 'public' });

    // Upload thumbnail to Vercel Blob (if provided)
    let thumbnailUrl = '/book-placeholder.png';
    if (thumbFile && thumbFile.size > 0) {
      const thumbBlob = await put(`covers/${Date.now()}-cover.jpg`, thumbFile, {
        access: 'public',
        contentType: 'image/jpeg',
      });
      thumbnailUrl = thumbBlob.url;
    }

    await connectDB();
    const book = await Book.create({
      title,
      author,
      totalPages,
      fileUrl:    pdfBlob.url,
      fileType:   fileExtension,
      thumbnail:  thumbnailUrl,
      uploadedBy: session.user.id,
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
