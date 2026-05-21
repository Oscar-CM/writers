import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { ads, articleAdSlots } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { publicCoverUrl } from '@/lib/r2';

function adToResponse(ad) {
  return { ...ad, imageUrl: publicCoverUrl(ad.imageKey) };
}

function pickRandom(arr) {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

// GET /api/ads?articleId=xxx  — returns up to 3 ads for an article
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get('articleId');

  // All active ads available for random selection
  const allActive = await db.select().from(ads).where(eq(ads.active, true));

  if (!articleId || !allActive.length) {
    // Just return 3 random active ads
    const shuffled = [...allActive].sort(() => Math.random() - 0.5);
    return NextResponse.json({ ads: shuffled.slice(0, 3).map(adToResponse) });
  }

  // Load article's slot assignments
  const slots = await db.select().from(articleAdSlots).where(eq(articleAdSlots.articleId, articleId));
  const bySlot = Object.fromEntries(slots.map(s => [s.slot, s.adId]));

  const result = [];
  for (let slot = 1; slot <= 3; slot++) {
    const assignedId = bySlot[slot];
    if (assignedId) {
      const [ad] = await db.select().from(ads).where(and(eq(ads.id, assignedId), eq(ads.active, true)));
      result.push(ad ? adToResponse(ad) : null);
    } else {
      // Random from active pool (exclude already picked)
      const used = result.filter(Boolean).map(a => a.id);
      const pool = allActive.filter(a => !used.includes(a.id));
      result.push(pool.length ? adToResponse(pickRandom(pool)) : null);
    }
  }

  return NextResponse.json({ ads: result });
}
