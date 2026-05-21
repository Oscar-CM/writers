import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { jobApplications } from '@/lib/db/schema';

export async function POST(req) {
  try {
    const { fullName, email, phone, country, writingLevel, experience, motivation, portfolio } = await req.json();

    if (!fullName || !email || !motivation) {
      return NextResponse.json({ error: 'Name, email, and motivation are required.' }, { status: 400 });
    }

    await db.insert(jobApplications).values({
      fullName,
      email,
      phone: phone || null,
      country: country || null,
      writingLevel: writingLevel || null,
      experience: experience || null,
      motivation,
      portfolio: portfolio || null,
      status: 'pending',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Application error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
