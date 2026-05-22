import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { books, purchases } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getDownloadUrl } from '@/lib/r2';

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;

  const [book] = await db.select().from(books).where(eq(books.id, id));
  if (!book) return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
  if (!book.pdfKey) return NextResponse.json({ error: 'Download not available yet.' }, { status: 404 });

  // Check access for paid books
  if (!book.isFree) {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(and(
        eq(purchases.userId, session.user.id),
        eq(purchases.productId, id),
        eq(purchases.productType, 'book'),
        eq(purchases.status, 'SUCCESS'),
      ));

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase required to download this book.' }, { status: 403 });
    }
  }

  // Increment download count (fire-and-forget, doesn't block the response)
  db.update(books)
    .set({ downloadCount: sql`${books.downloadCount} + 1` })
    .where(eq(books.id, id))
    .catch(() => {});

  // Generate presigned URL valid 15 minutes
  const url = await getDownloadUrl(book.pdfKey, 900);

  return NextResponse.redirect(url);
}
