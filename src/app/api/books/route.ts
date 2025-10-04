import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import { Book } from '@/lib/models/Book';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    await connectDB();

    const filter: any = {};
    if (userId) {
      filter.uploadedBy = userId;
    }

    const books = await Book.find(filter)
      .populate('uploadedBy', 'name username')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ books });
  } catch (error) {
    console.error('Fetch books error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}
