import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import { Book } from '@/lib/models/Book';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Session:', session); // DEBUG
    console.log('User ID:', session?.user?.id); // DEBUG
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const author = formData.get('author') as string || 'Unknown';
    const totalPages = parseInt(formData.get('totalPages') as string);

    if (!file || !title || !totalPages) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'pdf' && fileExtension !== 'epub') {
      return NextResponse.json(
        { error: 'Only PDF and EPUB files are allowed' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Save to database
    await connectDB();
    const book = await Book.create({
      title,
      author,
      totalPages,
      fileUrl: `/uploads/${filename}`,
      fileType: fileExtension,
      uploadedBy: session.user.id, // Make sure this has a value!
    });

    console.log('Book created with uploadedBy:', book.uploadedBy); // DEBUG

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}