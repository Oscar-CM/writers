import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { purchases, profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// MegaPay webhook — called server-to-server when a payment completes
export async function POST(req) {
  try {
    const body = await req.json();
    const { reference, status } = body;

    if (!reference) return NextResponse.json({ received: true });

    const isPaid = ['COMPLETED', 'SUCCESS'].includes((status || '').toUpperCase());
    const isFailed = ['FAILED', 'CANCELLED'].includes((status || '').toUpperCase());

    if (isPaid) {
      const [purchase] = await db.select().from(purchases).where(eq(purchases.id, reference));
      if (purchase && purchase.status !== 'SUCCESS') {
        await db.update(purchases).set({ status: 'SUCCESS' }).where(eq(purchases.id, reference));
        if (purchase.productType === 'activation' && purchase.userId) {
          await db.update(profiles).set({ activated: true }).where(eq(profiles.userId, purchase.userId));
        }
      }
    }

    if (isFailed) {
      await db.update(purchases).set({ status: 'FAILED' }).where(eq(purchases.id, reference));
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ received: true });
  }
}
