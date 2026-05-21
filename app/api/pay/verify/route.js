import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { purchases, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { transactionRequestId, purchaseId } = await req.json();
    if (!transactionRequestId) return NextResponse.json({ error: 'Missing transactionRequestId' }, { status: 400 });

    // Check MegaPay status
    const verifyRes = await fetch('https://megapay.co.ke/backend/v1/transactionstatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.MEGAPAY_API_KEY,
        email: process.env.MEGAPAY_EMAIL,
        transaction_request_id: transactionRequestId,
      }),
    });

    const verifyData = await verifyRes.json();
    const rawStatus = (verifyData?.TransactionStatus || verifyData?.status || 'PENDING').toUpperCase();

    // MegaPay returns COMPLETED or SUCCESS for paid
    const isPaid = rawStatus === 'COMPLETED' || rawStatus === 'SUCCESS';
    const isFailed = rawStatus === 'FAILED' || rawStatus === 'CANCELLED';

    if (isPaid && purchaseId) {
      // Fetch the purchase to know what type it is
      const [purchase] = await db
        .select()
        .from(purchases)
        .where(and(eq(purchases.id, purchaseId), eq(purchases.userId, session.user.id)));

      if (purchase && purchase.status !== 'SUCCESS') {
        // Mark purchase as successful
        await db.update(purchases).set({ status: 'SUCCESS' }).where(eq(purchases.id, purchaseId));

        // Apply effect based on product type
        if (purchase.productType === 'activation') {
          await db.update(profiles).set({ activated: true }).where(eq(profiles.userId, session.user.id));
        }
        // For 'resources', access is checked by querying SUCCESS purchases — no profile update needed
      }
    }

    if (isFailed && purchaseId) {
      await db.update(purchases).set({ status: 'FAILED' }).where(eq(purchases.id, purchaseId));
    }

    return NextResponse.json({
      status: isPaid ? 'COMPLETED' : isFailed ? 'FAILED' : 'PENDING',
      raw: rawStatus,
    });

  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.json({ error: 'Verification failed.' }, { status: 500 });
  }
}
