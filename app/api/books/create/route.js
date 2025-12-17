import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use SERVICE ROLE here — NEVER expose this to client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { title, description, price, pdf_path, cover_url } = await req.json();

    // Generate slug
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    const { data, error } = await supabaseAdmin
      .from('books')
      .insert({
        title,
        slug,
        description,
        price,
        pdf_path,
        cover_url,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ book: data });
  } catch (err) {
    console.error('API ERROR:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
