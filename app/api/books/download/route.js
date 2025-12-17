import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with SERVICE ROLE
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { bookId } = await req.json();

    // Optionally, check purchase status here with user session
    // For demo, we assume the user can download

    const { data: book, error } = await supabaseAdmin
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();

    if (error) throw error;

    // Generate a signed URL valid for 5 minutes
    const { signedURL, error: urlError } = supabaseAdmin.storage
      .from('books')
      .createSignedUrl(book.pdf_path, 300); // 300 seconds = 5 min

    if (urlError) throw urlError;

    return new Response(JSON.stringify({ downloadUrl: signedURL }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
