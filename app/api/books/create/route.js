import { NextResponse } from 'next/server';

// Deprecated — use /api/admin/books instead
export async function POST() {
  return NextResponse.json({ error: 'Use /api/admin/books' }, { status: 410 });
}
