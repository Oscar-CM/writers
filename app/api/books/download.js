import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { bookId } = req.body;
  const token = req.headers.authorization?.replace('Bearer ', '');

  // Get user from Supabase token
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Check purchase
  const { data: purchase } = await supabaseAdmin
    .from('purchases')
    .select('*')
    .eq('book_id', bookId)
    .eq('user_id', user.id)
    .eq('status', 'PAID')
    .single();

  if (!purchase) return res.status(403).json({ error: 'No purchase found' });

  // Get book info
  const { data: book } = await supabaseAdmin
    .from('books')
    .select('pdf_path')
    .eq('id', bookId)
    .single();

  // Create signed URL (10 min)
  const { signedURL } = supabaseAdmin.storage
    .from('books')
    .createSignedUrl(book.pdf_path, 600);

  res.status(200).json({ downloadUrl: signedURL });
}
