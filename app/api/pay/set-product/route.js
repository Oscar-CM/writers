import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { purchases } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Called right after STK push to associate a productId with the purchase record
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { purchaseId, productId } = await req.json();
  if (!purchaseId || !productId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  await db
    .update(purchases)
    .set({ productId })
    .where(and(eq(purchases.id, purchaseId), eq(purchases.userId, session.user.id)));

  return NextResponse.json({ success: true });
}
