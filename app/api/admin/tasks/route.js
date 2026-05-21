import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { tasks } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rows = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  return NextResponse.json({ tasks: rows });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { title, description, level, wordCount, basePayout, deadline } = await req.json();

  if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });

  const [task] = await db
    .insert(tasks)
    .values({
      title,
      description: description || null,
      level: level || 'basic',
      wordCount: wordCount ? parseInt(wordCount) : null,
      basePayout: basePayout ? basePayout.toString() : null,
      deadline: deadline ? new Date(deadline) : null,
    })
    .returning();

  return NextResponse.json({ task });
}
