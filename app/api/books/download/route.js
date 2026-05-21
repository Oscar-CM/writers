import { NextResponse } from 'next/server';

// Deprecated — use /api/books/[id]/download instead
export async function POST() {
  return NextResponse.json({ error: 'Use /api/books/[id]/download' }, { status: 410 });
}
