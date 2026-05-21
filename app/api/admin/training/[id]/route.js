import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { trainingApplications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { status } = await req.json();
  await db.update(trainingApplications).set({ status }).where(eq(trainingApplications.id, params.id));
  return NextResponse.json({ success: true });
}
