import { NextResponse } from 'next/server';
import { initiateSTKPush } from '../../../../lib/intasend';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { bookId, phone, amount } = await req.json();

    if (!bookId || !phone || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1️⃣ Insert a pending purchase record
    const { data: purchase, error: insertError } = await supabaseAdmin
      .from('purchases')
      .insert({
        book_id: bookId,
        phone,
        amount,
        status: 'PENDING',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const stkData = await initiateSTKPush({
      phone,
      amount,
      reference: purchase.id, // unique reference for this purchase
    });

    return NextResponse.json({ purchase, stkData });
  } catch (err) {
    console.error('[API /stk-push] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
