import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { taskBids, tasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Return tasks where this user's bid was accepted
  const rows = await db
    .select({
      bidId: taskBids.id,
      bidStatus: taskBids.status,
      adminNote: taskBids.adminNote,
      delivered: taskBids.delivered,
      deliveryNote: taskBids.deliveryNote,
      deliveredAt: taskBids.deliveredAt,
      acceptedAt: taskBids.createdAt,
      taskId: tasks.id,
      title: tasks.title,
      description: tasks.description,
      level: tasks.level,
      wordCount: tasks.wordCount,
      basePayout: tasks.basePayout,
      deadline: tasks.deadline,
    })
    .from(taskBids)
    .innerJoin(tasks, eq(taskBids.taskId, tasks.id))
    .where(and(
      eq(taskBids.userId, session.user.id),
      eq(taskBids.status, 'accepted'),
    ));

  return NextResponse.json({ tasks: rows });
}
