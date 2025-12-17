'use server';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { productId, productType, phone, amount } = await req.json();

    console.log('STK Request:', { productId, productType, phone, amount });

    // -----------------------
    // 1. Validate input
    // -----------------------
    if (!productId || !productType || !phone || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // -----------------------
    // 2. Normalize phone
    // -----------------------
    let msisdn = phone.trim();
    if (msisdn.startsWith('0')) msisdn = '254' + msisdn.slice(1);
    else if (msisdn.startsWith('+')) msisdn = msisdn.slice(1);
    else if (!msisdn.startsWith('254')) {
      return NextResponse.json(
        { error: 'Invalid phone format. Use 2547xxxxxxx' },
        { status: 400 }
      );
    }

    // -----------------------
    // 3. Save PENDING purchase
    // -----------------------
    const { data: purchase, error: insertError } = await supabaseAdmin
      .from('products_purchases')
      .insert({
        product_id: productId,
        product_type: productType,
        phone: msisdn,
        amount: Number(amount),
        status: 'PENDING',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create purchase record' },
        { status: 500 }
      );
    }

    // -----------------------
    // 4. Call MegaPay STK Push
    // -----------------------
    const megapayPayload = {
      api_key: process.env.MEGAPAY_API_KEY,
      email: process.env.MEGAPAY_EMAIL,
      amount: Number(amount),
      msisdn,
      reference: purchase.id, // CRITICAL: tie payment to DB record
    };

    const megapayRes = await fetch(
      'https://megapay.co.ke/backend/v1/initiatestk',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(megapayPayload),
      }
    );

    const megapayData = await megapayRes.json();
    console.log('MegaPay Response:', megapayData);

    // -----------------------
    // 5. Handle MegaPay failure
    // -----------------------
    const isSuccess =
      megapayData.status === 'success' ||
      megapayData.success === true;

    if (!isSuccess) {
      await supabaseAdmin
        .from('purchases')
        .update({ status: 'FAILED' })
        .eq('id', purchase.id);

      return NextResponse.json(
        { error: megapayData.message || 'STK Push failed' },
        { status: 400 }
      );
    }

    // -----------------------
    // 6. Return response (WAIT FOR CALLBACK)
    // -----------------------
    return NextResponse.json({
      success: true,
      message: 'STK Push sent. Awaiting payment confirmation.',
      purchaseId: purchase.id,
    });

  } catch (error) {
    console.error('STK API Error:', error);
    return NextResponse.json(
      { error: 'Internal payment error' },
      { status: 500 }
    );
  }
}
