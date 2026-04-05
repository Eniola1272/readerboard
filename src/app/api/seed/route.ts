import { NextResponse } from 'next/server';

export async function GET() {
  // Seed route is disabled. Use the scripts/seed.js script locally instead.
  return NextResponse.json(
    { error: 'Not found' },
    { status: 404 }
  );
}