import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { settings } from '@/lib/db/schema';

export async function GET() {
  const rows = await db.select().from(settings);
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return NextResponse.json({
    activationFee: parseInt(map.activation_fee || '700'),
    resourcesFee: parseInt(map.resources_fee || '500'),
    activationDescription: map.activation_description || 'One-time fee to unlock writing tasks and full platform access.',
    ad_slot_1: map.ad_slot_1 || '',
    ad_slot_2: map.ad_slot_2 || '',
    ad_slot_3: map.ad_slot_3 || '',
  });
}
