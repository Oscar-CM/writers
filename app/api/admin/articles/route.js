import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { articles, articleComments } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      status: articles.status,
      readCount: articles.readCount,
      createdAt: articles.createdAt,
      commentCount: sql`(SELECT COUNT(*) FROM article_comments WHERE article_id = articles.id)::int`,
    })
    .from(articles)
    .orderBy(desc(articles.createdAt));

  return NextResponse.json({ articles: rows });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { title, excerpt, content, coverImage, status } = await req.json();
  if (!title || !content) return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 });

  const slug = title.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80)
    + '-' + Date.now().toString(36);

  const [article] = await db.insert(articles).values({
    title, slug, excerpt: excerpt || null, content,
    coverImage: coverImage || null,
    status: status || 'draft',
    authorId: session.user.id,
  }).returning();

  return NextResponse.json({ article });
}
