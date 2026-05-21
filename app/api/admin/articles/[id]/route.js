import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { articles, articleComments, profiles } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { publicCoverUrl } from '@/lib/r2';

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [article] = await db.select().from(articles).where(eq(articles.id, params.id));
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const comments = await db
    .select({
      id: articleComments.id,
      body: articleComments.body,
      createdAt: articleComments.createdAt,
      authorName: profiles.fullName,
    })
    .from(articleComments)
    .leftJoin(profiles, eq(profiles.userId, articleComments.userId))
    .where(eq(articleComments.articleId, params.id))
    .orderBy(asc(articleComments.createdAt));

  return NextResponse.json({
    article: { ...article, coverPublicUrl: publicCoverUrl(article.coverImage) },
    comments,
  });
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  await db.update(articles).set({
    ...( body.title && { title: body.title }),
    ...( body.excerpt !== undefined && { excerpt: body.excerpt }),
    ...( body.content && { content: body.content }),
    ...( body.coverImage !== undefined && { coverImage: body.coverImage }),
    ...( body.status && { status: body.status }),
    updatedAt: new Date(),
  }).where(eq(articles.id, params.id));

  return NextResponse.json({ success: true });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await db.delete(articles).where(eq(articles.id, params.id));
  return NextResponse.json({ success: true });
}
