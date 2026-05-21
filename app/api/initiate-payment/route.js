import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { purchases } from '@/lib/db/schema';
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

    const { productId, productType, phone, amount } = await req.json();

    if (!productType || !phone || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const msisdn = normalizePhone(phone);
    if (!msisdn) {
      return NextResponse.json({ error: 'Invalid phone format. Use 2547XXXXXXXX or 07XXXXXXXX.' }, { status: 400 });
    }

    // Save PENDING purchase
    const [purchase] = await db.insert(purchases).values({
      userId: session.user.id,
      productId: productId || null,
      productType,
      phone: msisdn,
      amount: String(amount),
      status: 'PENDING',
    }).returning();

    // Call MegaPay STK push
    const megapayRes = await fetch('https://megapay.co.ke/backend/v1/initiatestk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.MEGAPAY_API_KEY,
        email: process.env.MEGAPAY_EMAIL,
        amount: Number(amount),
        msisdn,
        reference: purchase.id,
      }),
    });

    const megapayData = await megapayRes.json();
    const isSuccess = megapayData.status === 'success' || megapayData.success === true;

    if (!isSuccess) {
      await db.update(purchases).set({ status: 'FAILED' }).where(eq(purchases.id, purchase.id));
      return NextResponse.json({ error: megapayData.message || 'STK Push failed' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'STK Push sent. Awaiting payment confirmation.',
      purchaseId: purchase.id,
      transactionRequestId: megapayData.transaction_request_id || megapayData.CheckoutRequestID,
    });

  } catch (error) {
    console.error('STK API Error:', error);
    return NextResponse.json({ error: 'Internal payment error' }, { status: 500 });
  }
}
