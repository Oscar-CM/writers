import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { purchases, books } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;

  const [book] = await db.select({ isFree: books.isFree }).from(books).where(eq(books.id, id));
  if (!book) return NextResponse.json({ hasAccess: false });

  if (book.isFree) return NextResponse.json({ hasAccess: true });

  const [purchase] = await db
    .select()
    .from(purchases)
    .where(and(
      eq(purchases.userId, session.user.id),
      eq(purchases.productId, id),
      eq(purchases.productType, 'book'),
      eq(purchases.status, 'SUCCESS'),
    ));

  return NextResponse.json({ hasAccess: !!purchase });
}
