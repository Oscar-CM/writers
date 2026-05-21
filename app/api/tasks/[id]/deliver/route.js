import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { taskBids } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { deliveryNote } = await req.json();

  const [bid] = await db
    .select()
    .from(taskBids)
    .where(and(eq(taskBids.taskId, params.id), eq(taskBids.userId, session.user.id), eq(taskBids.status, 'accepted')));

  if (!bid) return NextResponse.json({ error: 'No accepted bid found for this task.' }, { status: 404 });
  if (bid.delivered) return NextResponse.json({ error: 'Task already delivered.' }, { status: 409 });

  await db.update(taskBids).set({
    delivered: true,
    deliveryNote: deliveryNote?.trim() || null,
    deliveredAt: new Date(),
  }).where(eq(taskBids.id, bid.id));

  return NextResponse.json({ success: true });
}
