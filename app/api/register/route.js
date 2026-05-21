import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { users, profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { fullName, email, password, phone, country, writingLevel, referralCode } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    // Check if email is already registered
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [newUser] = await db
      .insert(users)
      .values({ email, passwordHash, role: 'writer' })
      .returning();

    await db.insert(profiles).values({
      userId: newUser.id,
      fullName,
      email,
      phone: phone || null,
      country: country || null,
      writingLevel: writingLevel || null,
      referralCode: referralCode || null,
      activated: false,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
