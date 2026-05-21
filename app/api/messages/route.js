import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { messages, profiles } from '@/lib/db/schema';
import { eq, or, and, isNull, desc } from 'drizzle-orm';

// GET — fetch threads for current user (inbox + sent)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Top-level threads (parentId is null) where user is sender or recipient
  const threads = await db
    .select({
      id: messages.id,
      subject: messages.subject,
      body: messages.body,
      isRead: messages.isRead,
      createdAt: messages.createdAt,
      fromUserId: messages.fromUserId,
      toUserId: messages.toUserId,
      fromName: profiles.fullName,
    })
    .from(messages)
    .leftJoin(profiles, eq(profiles.userId, messages.fromUserId))
    .where(
      and(
        isNull(messages.parentId),
        or(
          eq(messages.toUserId, session.user.id),
          eq(messages.fromUserId, session.user.id),
        ),
      ),
    )
    .orderBy(desc(messages.createdAt));

  return NextResponse.json({ threads });
}

// POST — send a message (admin only for new threads; users reply via /[id])
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { toUserId, subject, body } = await req.json();
  if (!toUserId || !body) {
    return NextResponse.json({ error: 'toUserId and body are required.' }, { status: 400 });
  }

  const [msg] = await db.insert(messages).values({
    fromUserId: session.user.id,
    toUserId,
    subject: subject || null,
    body,
    isRead: false,
    parentId: null,
  }).returning();

  return NextResponse.json({ message: msg });
}
