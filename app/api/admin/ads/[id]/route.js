import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { ads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { deleteObject } from '@/lib/r2';

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  await db.update(ads).set({
    ...(body.title && { title: body.title }),
    ...(body.linkUrl !== undefined && { linkUrl: body.linkUrl }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.active !== undefined && { active: body.active }),
    ...(body.imageKey !== undefined && { imageKey: body.imageKey }),
  }).where(eq(ads.id, params.id));

  return NextResponse.json({ success: true });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [ad] = await db.select().from(ads).where(eq(ads.id, params.id));
  if (ad?.imageKey) await deleteObject(ad.imageKey).catch(() => {});

  await db.delete(ads).where(eq(ads.id, params.id));
  return NextResponse.json({ success: true });
}
