import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { trainingApplications, profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { phoneNumber, email, experienceLevel, goals } = await req.json();

  if (!phoneNumber || !email || !experienceLevel || !goals) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  // Get writer's full name from profile
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, session.user.id));

  await db.insert(trainingApplications).values({
    userId: session.user.id,
    fullName: profile?.fullName || session.user.name || 'Unknown',
    phoneNumber,
    email,
    experienceLevel,
    goals,
  });

  return NextResponse.json({ success: true });
}
