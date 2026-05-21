import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { books } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const rows = await db.select().from(books).orderBy(desc(books.createdAt));
  return NextResponse.json({ books: rows });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { title, description, price, isFree, pdfKey, coverKey } = await req.json();

  if (!title || !pdfKey || !coverKey) {
    return NextResponse.json({ error: 'Title, pdfKey, and coverKey are required.' }, { status: 400 });
  }

  const slug = title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  const [book] = await db.insert(books).values({
    title,
    slug,
    description: description || null,
    price: isFree ? '0' : (price ? price.toString() : null),
    isFree: !!isFree,
    pdfKey,
    coverKey,
  }).returning();

  return NextResponse.json({ book });
}
