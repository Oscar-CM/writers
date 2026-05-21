import { NextResponse } from 'next/server';

// Deprecated
export async function POST() {
  return NextResponse.json({ error: 'Endpoint deprecated.' }, { status: 410 });
}
