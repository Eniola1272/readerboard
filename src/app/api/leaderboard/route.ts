import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function GET() {
  await connectDB();
  const users = await User.find()
    .sort({ pagesRead: -1 })
    .limit(100)
    .lean();
  return NextResponse.json({ users });
}