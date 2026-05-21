import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { articleComments, articles, profiles } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(req, { params }) {
  const [article] = await db.select({ id: articles.id }).from(articles).where(eq(articles.slug, params.slug));
  if (!article) return NextResponse.json({ comments: [] });

  const rows = await db
    .select({
      id: articleComments.id,
      body: articleComments.body,
      createdAt: articleComments.createdAt,
      userId: articleComments.userId,
      authorName: profiles.fullName,
    })
    .from(articleComments)
    .leftJoin(profiles, eq(profiles.userId, articleComments.userId))
    .where(eq(articleComments.articleId, article.id))
    .orderBy(asc(articleComments.createdAt));

  return NextResponse.json({ comments: rows });
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'You must be logged in to comment.' }, { status: 401 });

  const { body } = await req.json();
  if (!body?.trim() || body.trim().length < 2) {
    return NextResponse.json({ error: 'Comment cannot be empty.' }, { status: 400 });
  }

  const [article] = await db.select({ id: articles.id }).from(articles).where(eq(articles.slug, params.slug));
  if (!article) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });

  const [comment] = await db.insert(articleComments).values({
    articleId: article.id,
    userId: session.user.id,
    body: body.trim(),
  }).returning();

  return NextResponse.json({ comment });
}
