import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { tasks } from '@/lib/db/schema';
import { asc, sql, gt, or, isNull } from 'drizzle-orm';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 6;
  const offset = (page - 1) * limit;
  const now = new Date();

  // Only show tasks that haven't passed their deadline (or have no deadline set)
  const activeFilter = or(isNull(tasks.deadline), gt(tasks.deadline, now));

  const [{ count }] = await db
    .select({ count: sql`count(*)::int` })
    .from(tasks)
    .where(activeFilter);

  const items = await db
    .select()
    .from(tasks)
    .where(activeFilter)
    .orderBy(asc(tasks.deadline))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ tasks: items, total: count });
}
