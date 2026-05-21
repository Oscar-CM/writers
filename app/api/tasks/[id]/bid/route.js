import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { taskBids, tasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: taskId } = params;
  const { bidDescription } = await req.json();

  if (!bidDescription || bidDescription.trim().length < 10) {
    return NextResponse.json({ error: 'Bid description must be at least 10 characters.' }, { status: 400 });
  }

  // Confirm task exists and is not expired
  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  if (task.deadline && new Date(task.deadline) < new Date()) {
    return NextResponse.json({ error: 'This task is no longer accepting bids.' }, { status: 410 });
  }

  // Check for existing bid
  const [existing] = await db
    .select()
    .from(taskBids)
    .where(and(eq(taskBids.taskId, taskId), eq(taskBids.userId, session.user.id)));

  if (existing) {
    return NextResponse.json({ error: 'You have already submitted a bid for this task.' }, { status: 409 });
  }

  const [bid] = await db.insert(taskBids).values({
    taskId,
    userId: session.user.id,
    bidDescription: bidDescription.trim(),
    status: 'pending',
  }).returning();

  return NextResponse.json({ bid });
}
