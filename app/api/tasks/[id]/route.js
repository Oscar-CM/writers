import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { tasks, taskBids } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;

  const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  // Task expired: deadline is set and has passed
  if (task.deadline && new Date(task.deadline) < new Date()) {
    return NextResponse.json({ error: 'This task is no longer available.' }, { status: 410 });
  }

  // Check if user already bid
  const [existingBid] = await db
    .select()
    .from(taskBids)
    .where(and(eq(taskBids.taskId, id), eq(taskBids.userId, session.user.id)));

  return NextResponse.json({ task, existingBid: existingBid || null });
}
