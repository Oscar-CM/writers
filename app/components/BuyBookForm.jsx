'use client';

import { useState } from 'react';

export default function PayForBook({ bookId, price }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [stkResponse, setStkResponse] = useState(null);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/mpesa-stk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, phone, amount: price }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      setStkResponse(data.stkData);
      alert('STK Push sent! Check your phone to complete payment.');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-2">
      <input
        type="tel"
        placeholder="Enter phone number (2547xxxxxxx)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        className="border p-2 w-full"
      />
      <button type="submit" disabled={loading} className="bg-[#FF7A00] text-white px-4 py-2 rounded">
        {loading ? 'Processing...' : `Pay Ksh ${price}`}
      </button>

      {stkResponse && (
        <pre className="bg-gray-100 p-2 mt-2 text-sm overflow-x-auto">
          {JSON.stringify(stkResponse, null, 2)}
        </pre>
      )}
    </form>
  );
}
