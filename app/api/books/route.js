import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { books } from '@/lib/db/schema';
// drizzle-orm imports not used — filtering done in JS after initial fetch
import { publicCoverUrl } from '@/lib/r2';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const filter = searchParams.get('filter') || 'all'; // all | free | paid
  const sort = searchParams.get('sort') || 'newest'; // newest | price_asc | price_desc | title
  const maxPrice = searchParams.get('maxPrice');
  const minPrice = searchParams.get('minPrice');

  let rows = await db.select().from(books);

  // Apply search
  if (search) {
    rows = rows.filter(b =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Apply free/paid filter
  if (filter === 'free') rows = rows.filter(b => b.isFree);
  if (filter === 'paid') rows = rows.filter(b => !b.isFree);

  // Apply price range filter
  if (minPrice) rows = rows.filter(b => !b.isFree && parseFloat(b.price || 0) >= parseFloat(minPrice));
  if (maxPrice) rows = rows.filter(b => b.isFree || parseFloat(b.price || 0) <= parseFloat(maxPrice));

  // Apply sort
  if (sort === 'price_asc') rows.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
  else if (sort === 'price_desc') rows.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
  else if (sort === 'title') rows.sort((a, b) => a.title.localeCompare(b.title));
  else rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest

  // Add public cover URL (strips sensitive pdfKey from response)
  // eslint-disable-next-line no-unused-vars
  const result = rows.map(({ pdfKey, ...rest }) => ({
    ...rest,
    coverPublicUrl: publicCoverUrl(rest.coverKey),
  }));

  return NextResponse.json({ books: result });
}
