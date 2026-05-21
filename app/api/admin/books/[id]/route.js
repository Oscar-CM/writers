import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { books } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { deleteObject } from '@/lib/r2';

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [book] = await db.select().from(books).where(eq(books.id, params.id));
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Delete files from R2
  await Promise.allSettled([
    book.pdfKey ? deleteObject(book.pdfKey) : Promise.resolve(),
    book.coverKey ? deleteObject(book.coverKey) : Promise.resolve(),
  ]);

  await db.delete(books).where(eq(books.id, params.id));
  return NextResponse.json({ success: true });
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, price, isFree } = body;

  await db.update(books).set({
    ...(title && { title }),
    ...(description !== undefined && { description }),
    ...(price !== undefined && { price: isFree ? '0' : price?.toString() }),
    ...(isFree !== undefined && { isFree }),
  }).where(eq(books.id, params.id));

  return NextResponse.json({ success: true });
}
