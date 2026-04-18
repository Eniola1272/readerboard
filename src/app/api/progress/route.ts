import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import {Progress} from '@/lib/db/models/Progress';
import User from '@/lib/db/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookId, currentPage, totalPages } = await req.json();

    await connectDB();
    
    let progress = await Progress.findOne({ 
      userId: session.user.id, 
      bookId 
    });
    
    if (!progress) {
      progress = await Progress.create({
        userId: session.user.id,
        bookId,
        currentPage,
        visitedPages: [currentPage],
        pagesRead: 1,
      });
    } else {
      const visitedSet = new Set(progress.visitedPages);
      const oldCount = visitedSet.size;
      visitedSet.add(currentPage);
      const newPagesRead = visitedSet.size - oldCount;
      
      progress.currentPage = currentPage;
      progress.visitedPages = Array.from(visitedSet);
      progress.pagesRead = visitedSet.size;
      progress.lastReadDate = new Date();
      
      if (totalPages && visitedSet.size >= totalPages) {
        progress.completed = true;
      }
      
      await progress.save();
      
      // Update user's total pages read
      if (newPagesRead > 0) {
        await User.findByIdAndUpdate(session.user.id, {
          $inc: { pagesRead: newPagesRead },
          lastActive: new Date(),
        });
      }
    }
    
    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json(
        { error: 'bookId is required' }, 
        { status: 400 }
      );
    }

    await connectDB();

    const progress = await Progress.findOne({
      userId: session.user.id,
      bookId,
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' }, 
      { status: 500 }
    );
  }
}