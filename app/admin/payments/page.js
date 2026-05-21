'use client';

import { useEffect, useState } from 'react';

const statusColor = { PENDING: 'bg-yellow-100 text-yellow-700', SUCCESS: 'bg-green-100 text-green-700', FAILED: 'bg-red-100 text-red-600' };

export default function AdminPayments() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/payments')
      .then(r => r.json())
      .then(d => { setPurchases(d.purchases || []); setLoading(false); });
  }, []);

  if (loading) return <p className="text-gray-500">Loading payment records...</p>;

  const total = purchases.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
        <p className="text-sm text-gray-500">{purchases.length} records — Total collected: KES {total.toFixed(2)}</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold">
            <tr>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Amount (KES)</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Reference</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {purchases.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{p.phone || '—'}</td>
                <td className="px-4 py-3">
                  <span className="capitalize text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{p.productType}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-800">{p.amount}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs font-mono">{p.reference || '—'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No payment records yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
