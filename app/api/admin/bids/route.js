import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { taskBids, tasks, profiles } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rows = await db
    .select({
      bidId: taskBids.id,
      status: taskBids.status,
      bidDescription: taskBids.bidDescription,
      adminNote: taskBids.adminNote,
      createdAt: taskBids.createdAt,
      userId: taskBids.userId,
      taskId: taskBids.taskId,
      taskTitle: tasks.title,
      taskLevel: tasks.level,
      taskDeadline: tasks.deadline,
      writerName: profiles.fullName,
      writerEmail: profiles.email,
      writingLevel: profiles.writingLevel,
    })
    .from(taskBids)
    .innerJoin(tasks, eq(taskBids.taskId, tasks.id))
    .leftJoin(profiles, eq(profiles.userId, taskBids.userId))
    .orderBy(desc(taskBids.createdAt));

  return NextResponse.json({ bids: rows });
}
