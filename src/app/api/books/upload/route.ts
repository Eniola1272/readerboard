import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import { Book } from '@/lib/db/models/Book';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file       = formData.get('file')       as File;
    const title      = formData.get('title')      as string;
    const author     = formData.get('author')     as string || 'Unknown';
    const totalPages = parseInt(formData.get('totalPages') as string);
    const thumbFile  = formData.get('thumbnail')  as File | null;

    if (!file || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be under 50MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save PDF
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Save thumbnail if provided
    let thumbnailUrl = '/book-placeholder.png';
    if (thumbFile && thumbFile.size > 0) {
      const thumbDir = join(uploadsDir, 'thumbnails');
      if (!existsSync(thumbDir)) await mkdir(thumbDir, { recursive: true });
      const thumbBytes = await thumbFile.arrayBuffer();
      const thumbName  = `cover-${Date.now()}.jpg`;
      await writeFile(join(thumbDir, thumbName), Buffer.from(thumbBytes));
      thumbnailUrl = `/uploads/thumbnails/${thumbName}`;
    }

    // Save to database
    await connectDB();
    const book = await Book.create({
      title,
      author,
      totalPages,
      fileUrl:   `/uploads/${filename}`,
      fileType:  fileExtension,
      thumbnail: thumbnailUrl,
      uploadedBy: session.user.id,
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}