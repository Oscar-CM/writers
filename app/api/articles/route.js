import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { articles, profiles } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { publicCoverUrl } from '@/lib/r2';

export async function GET() {
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      coverImage: articles.coverImage,
      readCount: articles.readCount,
      createdAt: articles.createdAt,
      authorName: profiles.fullName,
    })
    .from(articles)
    .leftJoin(profiles, eq(profiles.userId, articles.authorId))
    .where(eq(articles.status, 'published'))
    .orderBy(desc(articles.createdAt));

  return NextResponse.json({
    articles: rows.map(a => ({
      ...a,
      coverPublicUrl: publicCoverUrl(a.coverImage),
    })),
  });
}
