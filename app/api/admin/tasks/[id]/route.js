import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { tasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = params;
  const body = await req.json();
  const { title, description, level, wordCount, basePayout, deadline } = body;

  await db.update(tasks).set({
    ...(title && { title }),
    ...(description !== undefined && { description }),
    ...(level && { level }),
    ...(wordCount !== undefined && { wordCount: parseInt(wordCount) }),
    ...(basePayout !== undefined && { basePayout: basePayout?.toString() }),
    ...(deadline && { deadline: new Date(deadline) }),
  }).where(eq(tasks.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await db.delete(tasks).where(eq(tasks.id, params.id));
  return NextResponse.json({ success: true });
}
