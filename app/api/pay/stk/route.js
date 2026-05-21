import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { purchases, settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

function normalizePhone(raw) {
  let p = raw.trim().replace(/\s+/g, '');
  if (p.startsWith('0')) p = '254' + p.slice(1);
  else if (p.startsWith('+')) p = p.slice(1);
  if (!/^254\d{9}$/.test(p)) return null;
  return p;
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { phone, productType, overrideAmount } = await req.json();

    const msisdn = normalizePhone(phone);
    if (!msisdn) {
      return NextResponse.json({ error: 'Invalid phone number. Use format 2547XXXXXXXX or 07XXXXXXXX.' }, { status: 400 });
    }

    // Determine amount from settings unless overridden
    let amount = overrideAmount;
    if (!amount) {
      const feeKey = productType === 'resources' ? 'resources_fee' : 'activation_fee';
      const [row] = await db.select().from(settings).where(eq(settings.key, feeKey));
      amount = row ? parseInt(row.value) : 700;
    }

    // Create a PENDING purchase record
    const [purchase] = await db.insert(purchases).values({
      userId: session.user.id,
      productType,
      phone: msisdn,
      amount: amount.toString(),
      status: 'PENDING',
    }).returning();

    // Send MegaPay STK push
    const megapayRes = await fetch('https://megapay.co.ke/backend/v1/initiatestk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.MEGAPAY_API_KEY,
        email: process.env.MEGAPAY_EMAIL,
        amount,
        msisdn,
        reference: purchase.id,
      }),
    });

    const megapayData = await megapayRes.json();

    const isSuccess = megapayData.status === 'success' || megapayData.success === true;

    if (!isSuccess) {
      await db.update(purchases).set({ status: 'FAILED' }).where(eq(purchases.id, purchase.id));
      return NextResponse.json(
        { error: megapayData.message || megapayData.error || 'STK push failed. Check your phone number.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      purchaseId: purchase.id,
      transactionRequestId: megapayData.transaction_request_id || megapayData.CheckoutRequestID,
      amount,
    });

  } catch (err) {
    console.error('STK error:', err);
    return NextResponse.json({ error: 'Payment initiation failed.' }, { status: 500 });
  }
}
