'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function WritingToolsSection() {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle');
  const [purchaseId, setPurchaseId] = useState(null);
  const [error, setError] = useState(null);

  // idle | processing | awaiting_pin | paid | error

  // -----------------------
  // Tools (UNCHANGED)
  // -----------------------
  const tools = useMemo(
    () => [
      { id: '550e8400-e29b-41d4-a716-446655440000', name: 'ChatGPT Premium (Shared)', price: 500, type: 'tool' },
      { id: '550e8400-e29b-41d4-a716-446655440001', name: 'ChatGPT Teams Personal', price: 1500, type: 'tool' },
      { id: '550e8400-e29b-41d4-a716-446655440002', name: 'ChatGPT Whole Workspace', price: 2500, type: 'tool' },
      { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Turnitin Shared', price: 500, type: 'tool' },
      { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Turnitin Personal (Multiple Devices)', price: 1500, type: 'tool' },
      { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Turnitin Personal (Single Device)', price: 1250, type: 'tool' },
      { id: '550e8400-e29b-41d4-a716-446655440006', name: 'Stealthwriter Basic', price: 1000, type: 'tool' },
      { id: '550e8400-e29b-41d4-a716-446655440007', name: 'Stealthwriter Premium', price: 2000, type: 'tool' },
      { id: '550e8400-e29b-41d4-a716-446655440008', name: 'Surfshark VPN', price: 500, type: 'tool' },
      { id: '550e8400-e29b-41d4-a716-446655440009', name: 'ExpressVPN', price: 500, type: 'tool' },
      { id: '550e8400-e29b-41d4-a716-446655440010', name: 'NordVPN', price: 500, type: 'tool' },
      { id: '550e8400-e29b-41d4-a716-446655440011', name: 'Mullvad VPN', price: 800, type: 'tool' },
      { id: '550e8400-e29b-41d4-a716-446655440012', name: 'Windscribe VPN', price: 500, type: 'tool' },
      { id: '550e8400-e29b-41d4-a716-446655440013', name: 'Grammarly', price: 150, type: 'tool' },
      { id: '550e8400-e29b-41d4-a716-446655440014', name: 'AI & Plagiarism Reports', price: 50, type: 'tool' },
      { id: '550e8400-e29b-41d4-a716-446655440015', name: 'QuillBot', price: 250, type: 'tool' },
    ],
    []
  );

  const filteredTools = useMemo(
    () => tools.filter(t => t.name.toLowerCase().includes(search.toLowerCase())),
    [search, tools]
  );

  // -----------------------
  // Payment Handler
  // -----------------------
  const handlePayment = async (e) => {
    e.preventDefault();
    setStatus('processing');
    setError(null);

    try {
      const res = await fetch('/api/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          productType: selectedProduct.type,
          phone,
          amount: selectedProduct.price,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPurchaseId(data.purchaseId);
        setStatus('awaiting_pin');
      } else {
        throw new Error(data.error || data.message);
      }
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Writing Tools & Monthly Offers
        </h2>

        <p className="text-sm text-gray-600">
          Instant delivery via email after payment · Support:{' '}
          <span className="font-medium">info@masterwriters.org</span>
        </p>

        <input
          type="text"
          placeholder="Search tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="p-5 bg-white border rounded-xl shadow hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {tool.name}
              </h3>

              <p className="text-[#FF7A00] text-xl font-bold mt-2">
                KES {tool.price}
              </p>

              <button
                onClick={() => setSelectedProduct(tool)}
                className="mt-4 w-full bg-[#FF7A00] text-white py-2 rounded-md"
              >
                Buy
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ---------------- MODAL ---------------- */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full rounded-xl p-6 space-y-4">

            {status === 'idle' && (
              <form onSubmit={handlePayment} className="space-y-3">
                <h3 className="text-lg font-semibold">
                  Buy {selectedProduct.name}
                </h3>

                <p className="text-sm text-gray-600">
                  You will receive your product credentials in your email within a few seconds after successful payment.
                </p>

                <input
                  type="tel"
                  required
                  placeholder="Enter phone number (2547xxxxxxx)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-md p-2"
                />

                <button className="w-full bg-[#FF7A00] text-white py-2 rounded-md">
                  Pay KES {selectedProduct.price}
                </button>
              </form>
            )}

            {status === 'processing' && (
              <p className="text-center text-gray-700">
                Sending STK push…
              </p>
            )}

            {status === 'awaiting_pin' && (
              <div className="text-center space-y-2">
                <p className="font-semibold text-green-600">
                  STK Push Sent 📲
                </p>
                <p>Please check your phone</p>
                <p className="text-sm text-gray-600">
                  Enter your <strong>M-PESA PIN</strong> to complete the payment
                </p>
                <p className="text-xs text-gray-500">
                  Do not close this page
                </p>
              </div>
            )}

            {status === 'paid' && (
              <p className="text-center text-green-600 font-semibold">
                Payment successful ✅
              </p>
            )}

            {status === 'error' && (
              <p className="text-center text-red-600">
                {error || 'Payment failed. Please try again.'}
              </p>
            )}

            <button
              onClick={() => {
                setSelectedProduct(null);
                setPhone('');
                setStatus('idle');
                setPurchaseId(null);
                setError(null);
              }}
              className="w-full text-sm text-gray-500 mt-4"
            >
              Close
            </button>

          </div>
        </div>
      )}
    </>
  );
}
