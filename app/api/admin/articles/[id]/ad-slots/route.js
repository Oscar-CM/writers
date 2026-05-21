import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { articleAdSlots } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET — current slot assignments for this article
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const slots = await db.select().from(articleAdSlots).where(eq(articleAdSlots.articleId, params.id));
  return NextResponse.json({ slots });
}

// POST — save slot assignments (replace all)
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { slots } = await req.json();
  // slots: [{ slot: 1, adId: 'uuid' | null }, ...]

  // Delete existing assignments for this article
  await db.delete(articleAdSlots).where(eq(articleAdSlots.articleId, params.id));

  // Insert new assignments
  if (slots?.length) {
    await db.insert(articleAdSlots).values(
      slots.map(s => ({ articleId: params.id, slot: s.slot, adId: s.adId || null }))
    );
  }

  return NextResponse.json({ success: true });
}
