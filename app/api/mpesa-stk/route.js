import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { phone, amount, user_id } = await request.json();

    if (!phone || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Format phone to 2547xxxxxxxx
    const formattedPhone = phone.replace(/^0/, "254");

    const res = await fetch("https://api.intasend.com/api/v1/payment/mpesa/stkpush/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.INTASEND_SECRET_KEY}`,
      },
      body: JSON.stringify({
        phone_number: formattedPhone,
        amount: amount,
        api_ref: `activation_${user_id}_${Date.now()}`,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: 400 });
    }

    return NextResponse.json({ success: true, checkout: data });
  } catch (err) {
    console.error("STK ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
