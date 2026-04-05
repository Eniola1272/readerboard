import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export async function GET() {
  try {
    await connectDB();
    const userCount = await User.countDocuments();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      users: userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}