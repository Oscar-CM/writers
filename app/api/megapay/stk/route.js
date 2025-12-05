import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { phone, amount, reference } = await req.json();

    // Megapay required fields
    const payload = {
      api_key: process.env.MEGAPAY_API_KEY,
      email: process.env.MEGAPAY_EMAIL,
      amount: amount,
      msisdn: phone,
      reference: reference,
    };

    const response = await fetch("https://megapay.co.ke/backend/v1/initiatestk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "STK Push Failed", details: error.message },
      { status: 500 }
    );
  }
}
