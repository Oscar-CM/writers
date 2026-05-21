import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { articleComments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await db.delete(articleComments).where(eq(articleComments.id, params.id));
  return NextResponse.json({ success: true });
}
