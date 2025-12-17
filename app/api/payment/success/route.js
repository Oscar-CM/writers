import { NextResponse } from 'next/server';
import { sendPdfEmail } from '@/lib/sendPdfEmail';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, status } = body;

    if (status !== 'SUCCESS') {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      );
    }

    await sendPdfEmail(email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to send PDF' },
      { status: 500 }
    );
  }
}
