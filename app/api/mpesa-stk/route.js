import { NextResponse } from 'next/server';

// This route is deprecated. Use /api/pay/stk instead.
export async function POST() {
  return NextResponse.json({ error: 'Use /api/pay/stk' }, { status: 410 });
}
