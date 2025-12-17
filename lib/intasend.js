export async function initiateSTKPush({ phone, amount, reference }) {
  if (!process.env.INTASEND_SECRET_KEY) {
    throw new Error('INTASEND_SECRET_KEY is not defined in env variables');
  }
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error('NEXT_PUBLIC_BASE_URL is not defined in env variables');
  }

  const url = 'https://api.intasend.co.ke/mpesa/stkpush';
  const body = {
    phone,
    amount,
    accountReference: reference,
    transactionDesc: 'Book purchase',
    callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/pay/mpesa-callback`,
  };

  console.log('[INTASEND] STK Push Request Body:', body);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.INTASEND_SECRET_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null); // catch JSON parse errors
    console.log('[INTASEND] Response status:', res.status, 'data:', data);

    if (!res.ok) {
      throw new Error(data?.error || `STK Push failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error('[INTASEND] Fetch failed:', err);
    throw err;
  }
}
