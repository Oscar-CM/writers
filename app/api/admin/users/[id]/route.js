import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { profiles, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = params;
  const body = await req.json();
  const { activated, role, status } = body;

  // Update profile activation
  if (activated !== undefined) {
    await db.update(profiles).set({ activated }).where(eq(profiles.userId, id));
  }

  // Update user role
  if (role) {
    await db.update(users).set({ role }).where(eq(users.id, id));
  }

  // Update profile status
  if (status) {
    await db.update(profiles).set({ status }).where(eq(profiles.userId, id));
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = params;
  // Cascades to profiles via FK
  await db.delete(users).where(eq(users.id, id));

  return NextResponse.json({ success: true });
}
