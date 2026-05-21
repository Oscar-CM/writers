import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { purchases } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const [purchase] = await db
    .select({ status: purchases.status })
    .from(purchases)
    .where(eq(purchases.id, id));

  if (!purchase) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ status: purchase.status });
}
