import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { articles, profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { publicCoverUrl } from '@/lib/r2';

export async function GET(req, { params }) {
  const { slug } = params;

  const [row] = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      content: articles.content,
      coverImage: articles.coverImage,
      readCount: articles.readCount,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      authorName: profiles.fullName,
    })
    .from(articles)
    .leftJoin(profiles, eq(profiles.userId, articles.authorId))
    .where(eq(articles.slug, slug));

  if (!row) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });

  // Increment read count (fire-and-forget)
  db.update(articles)
    .set({ readCount: (row.readCount || 0) + 1 })
    .where(eq(articles.slug, slug))
    .catch(() => {});

  return NextResponse.json({
    article: { ...row, coverPublicUrl: publicCoverUrl(row.coverImage) },
  });
}
