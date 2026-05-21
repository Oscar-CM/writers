import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { ads } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { publicCoverUrl } from '@/lib/r2';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rows = await db.select().from(ads).orderBy(desc(ads.createdAt));
  return NextResponse.json({ ads: rows.map(a => ({ ...a, imageUrl: publicCoverUrl(a.imageKey) })) });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { title, imageKey, linkUrl, description } = await req.json();
  if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });

  const [ad] = await db.insert(ads).values({
    title, imageKey: imageKey || null, linkUrl: linkUrl || null, description: description || null,
  }).returning();

  return NextResponse.json({ ad: { ...ad, imageUrl: publicCoverUrl(ad.imageKey) } });
}
