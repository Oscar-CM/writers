import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { messages, profiles } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

// GET — full thread (original + all replies)
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;

  // Fetch root message
  const [root] = await db.select().from(messages).where(eq(messages.id, id));
  if (!root) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Must be a participant
  if (root.fromUserId !== session.user.id && root.toUserId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Mark as read if recipient
  if (root.toUserId === session.user.id && !root.isRead) {
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
  }

  // Fetch all replies in this thread
  const replies = await db
    .select({
      id: messages.id,
      body: messages.body,
      fromUserId: messages.fromUserId,
      createdAt: messages.createdAt,
      isRead: messages.isRead,
      fromName: profiles.fullName,
    })
    .from(messages)
    .leftJoin(profiles, eq(profiles.userId, messages.fromUserId))
    .where(eq(messages.parentId, id))
    .orderBy(asc(messages.createdAt));

  return NextResponse.json({ root, replies });
}

// POST — reply to a thread
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: parentId } = params;
  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: 'Reply body is required.' }, { status: 400 });

  // Get root to determine the other participant
  const [root] = await db.select().from(messages).where(eq(messages.id, parentId));
  if (!root) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

  // Determine who to send reply to (the other party)
  const toUserId = root.fromUserId === session.user.id ? root.toUserId : root.fromUserId;

  const [reply] = await db.insert(messages).values({
    fromUserId: session.user.id,
    toUserId,
    subject: root.subject,
    body: body.trim(),
    isRead: false,
    parentId,
  }).returning();

  return NextResponse.json({ reply });
}

// PATCH — mark as read
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.update(messages).set({ isRead: true }).where(eq(messages.id, params.id));
  return NextResponse.json({ success: true });
}
