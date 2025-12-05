import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { transaction_request_id } = await req.json();

    if (!transaction_request_id) {
      return NextResponse.json({ error: "Missing transaction_request_id" }, { status: 400 });
    }

    const payload = {
      api_key: process.env.MEGAPAY_API_KEY,
      email: process.env.MEGAPAY_EMAIL,
      transaction_request_id,
    };

    const response = await fetch("https://megapay.co.ke/backend/v1/transactionstatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Megapay uses TransactionStatus
    const status = (data?.TransactionStatus || "PENDING").toUpperCase(); // e.g., COMPLETED, FAILED

    return NextResponse.json({
      raw: data,
      status, // COMPLETED, FAILED, PENDING
      transaction_request_id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Verification Failed", details: error.message },
      { status: 500 }
    );
  }
}
