'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Webhook received:', body);

    const { reference, status } = body;
    if (!reference || !status) {
      return new Response(JSON.stringify({ error: 'Missing reference or status' }), { status: 400 });
    }

    const normalizedStatus = status.toUpperCase();

    // Fetch purchase
    const { data: purchase, error: findError } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('id', reference)
      .single();

    if (findError || !purchase) {
      console.error('Purchase not found for reference:', reference, findError);
      return new Response(JSON.stringify({ error: 'Purchase not found' }), { status: 404 });
    }

    // Update purchase status
    const updateData = { status: normalizedStatus };
    if (normalizedStatus === 'SUCCESS') updateData.paid_at = new Date().toISOString();

    const { data: updatedPurchase, error: updateError } = await supabaseAdmin
      .from('purchases')
      .update(updateData)
      .eq('id', reference)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating purchase:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update purchase' }), { status: 500 });
    }

    console.log('Purchase updated successfully:', updatedPurchase);

    // If success, send email with eBook
    if (normalizedStatus === 'SUCCESS') {
      // 1️⃣ Get user email
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('id', purchase.user_id)
        .single();

      if (userError || !user) {
        console.error('User not found:', userError);
      } else {
        const buyerEmail = user.email;

        // 2️⃣ Get book info
        const { data: book, error: bookError } = await supabaseAdmin
          .from('books')
          .select('title,pdf_path')
          .eq('id', purchase.product_id)
          .single();

        if (bookError || !book) {
          console.error('Book not found:', bookError);
        } else {
          // 3️⃣ Send email using Supabase SMTP
          const { error: emailError } = await supabaseAdmin.functions.invoke('send-email', {
            body: {
              to: buyerEmail,
              subject: `Your Book: ${book.title}`,
              html: `
                <p>Hi,</p>
                <p>Thank you for your purchase of <strong>${book.title}</strong>.</p>
                <p>You can download your book using this link:</p>
                <a href="${book.pdf_path}" target="_blank">Download eBook</a>
                <p>For support, contact <strong>info@masterwriters.org</strong></p>
              `,
            },
          });

          if (emailError) console.error('Email sending failed:', emailError);
          else console.log('Email sent to:', buyerEmail);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, purchase: updatedPurchase }), { status: 200 });

  } catch (err) {
    console.error('Webhook handler error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
