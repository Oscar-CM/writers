'use server';

import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { productId, productType, phone, amount } = await req.json();

    // Log incoming request
    console.log('STK Request:', { productId, productType, phone, amount });

    // Validate input
    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    if (!productType) return NextResponse.json({ error: 'Missing productType' }, { status: 400 });
    if (!phone) return NextResponse.json({ error: 'Missing phone number' }, { status: 400 });
    if (!amount) return NextResponse.json({ error: 'Missing amount' }, { status: 400 });

    // Normalize phone
    let msisdn = phone.trim();
    if (msisdn.startsWith('0')) msisdn = '254' + msisdn.slice(1);
    else if (msisdn.startsWith('+')) msisdn = msisdn.slice(1);
    else if (msisdn.startsWith('254')) msisdn = msisdn;
    else return NextResponse.json({ error: 'Invalid phone format. Use 2547xxxxxxx' }, { status: 400 });

    // Save pending purchase
    const { data: purchase, error: insertError } = await supabaseAdmin
      .from('purchases')
      .insert({
        product_id: productId,
        product_type: productType,
        phone: msisdn,
        amount: parseFloat(amount),
        status: 'PENDING'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json({ error: `Database insert failed: ${insertError.message}` }, { status: 400 });
    }

    // Prepare MegaPay payload
    const payload = {
      api_key: process.env.MEGAPAY_API_KEY,
      email: process.env.MEGAPAY_EMAIL,
      amount: parseFloat(amount),
      msisdn,
      reference: purchase.id.toString(),
    };

    const megapayRes = await fetch("https://megapay.co.ke/backend/v1/initiatestk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const megapayData = await megapayRes.json();
    console.log('MegaPay Response:', megapayData);

    if (megapayData.status !== 'success' && !megapayData.success) {
      await supabaseAdmin
        .from('purchases')
        .update({ status: 'FAILED' })
        .eq('id', purchase.id);

      return NextResponse.json(
        { error: megapayData.message || 'Payment initiation failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'STK Push sent',
      purchaseId: purchase.id
    });

  } catch (error) {
    console.error('STK API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal payment error' },
      { status: 500 }
    );
  }
}
