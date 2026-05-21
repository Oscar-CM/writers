import { NextResponse } from 'next/server';

// Deprecated — use /api/pay/stk instead
export async function POST() {
  return NextResponse.json({ error: 'Use /api/pay/stk' }, { status: 410 });
}
