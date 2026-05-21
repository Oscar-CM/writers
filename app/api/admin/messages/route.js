import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { messages, profiles } from '@/lib/db/schema';
import { eq, desc, or } from 'drizzle-orm';

// GET — all threads admin is part of
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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
      or(
        eq(messages.fromUserId, session.user.id),
        eq(messages.toUserId, session.user.id),
      ),
    )
    .orderBy(desc(messages.createdAt));

  // Only top-level threads
  const topLevel = threads.filter(t => !t.parentId);

  // Get all writers for the compose dropdown
  const writers = await db
    .select({ id: users.id, fullName: profiles.fullName, email: users.email })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.role, 'writer'));

  return NextResponse.json({ threads: topLevel, writers });
}
