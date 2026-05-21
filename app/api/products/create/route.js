import { NextResponse } from 'next/server';

// Deprecated — products are managed via the admin panel
export async function POST() {
  return NextResponse.json({ error: 'Use the admin panel to manage products.' }, { status: 410 });
}
