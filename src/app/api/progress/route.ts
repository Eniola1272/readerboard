import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Progress } from '@/lib/models/Progress';
import { User } from '@/lib/models/User';


import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // Extend the session user type to include 'id'
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { bookId, currentPage } = await req.json();
  
  await connectDB();
  
  let progress = await Progress.findOne({ userId, bookId });
  
  if (!progress) {
    progress = await Progress.create({
      userId,
      bookId,
      currentPage,
      visitedPages: [currentPage],
    });
  } else {
    const visitedSet = new Set(progress.visitedPages);
    const oldCount = visitedSet.size;
    visitedSet.add(currentPage);
    const newPagesRead = visitedSet.size - oldCount;
    
    progress.currentPage = currentPage;
    progress.visitedPages = Array.from(visitedSet);
    await progress.save();
    
    if (newPagesRead > 0) {
      await User.findByIdAndUpdate(userId, {
        $inc: { pagesRead: newPagesRead }
      });
    }
  }
  
  return NextResponse.json({ progress });
}