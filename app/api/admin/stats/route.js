import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { users, profiles, tasks, jobApplications, trainingApplications } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';

function requireAdmin(session) {
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (guard) return guard;

  const [[{ totalUsers }], [{ activeUsers }], [{ totalTasks }], [{ pendingApplications }], [{ pendingTraining }]] =
    await Promise.all([
      db.select({ totalUsers: sql`count(*)::int` }).from(users),
      db.select({ activeUsers: sql`count(*)::int` }).from(profiles).where(eq(profiles.activated, true)),
      db.select({ totalTasks: sql`count(*)::int` }).from(tasks),
      db.select({ pendingApplications: sql`count(*)::int` }).from(jobApplications).where(eq(jobApplications.status, 'pending')),
      db.select({ pendingTraining: sql`count(*)::int` }).from(trainingApplications).where(eq(trainingApplications.status, 'pending')),
    ]);

  return NextResponse.json({ totalUsers, activeUsers, totalTasks, pendingApplications, pendingTraining });
}
