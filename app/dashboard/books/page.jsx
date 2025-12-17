'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function BooksCatalog() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle'); // idle | processing | success | error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBooks(data || []);
      } catch (err) {
        console.error('Error fetching books:', err);
        setErrorMessage('Failed to load books.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    setStatus('processing');
    setErrorMessage('');

    try {
      const res = await fetch('/api/mpesa-stk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedBook.id,   // matches purchases.product_id
          productType: 'book',          // explicitly specify type
          phone,
          amount: selectedBook.price,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      setStatus('success');
    } catch (err) {
      console.error('STK API Error:', err);
      setErrorMessage(err.message || 'Payment failed');
      setStatus('error');
    }
  };

  if (loading) return <p className="text-center mt-10">Loading books…</p>;
  if (!books.length) return <p className="text-center mt-10">No books found.</p>;

  return (
    <>
      {/* Header */}
      <div className="text-center mt-8 space-y-2">
        <h1 className="text-3xl font-bold">Top Books</h1>
        <p className="text-sm text-gray-600">
          Members get <span className="font-medium">20% off</span> any book · Support:{' '}
          <span className="font-medium">info@masterwriters.org</span>
        </p>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-6">
        {books.map((book) => (
          <div
            key={book.id}
            onClick={() => setSelectedBook(book)}
            className="bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg cursor-pointer overflow-hidden"
          >
            {book.cover_url && (
              <div className="aspect-[2/3] w-full bg-gray-50">
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-3 sm:p-4 space-y-1">
              <h3 className="font-semibold text-sm sm:text-base leading-snug">{book.title}</h3>
              <p className="font-bold text-[#FF7A00] text-sm sm:text-base">Ksh {book.price}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">Tap to buy</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Overlay */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full rounded-xl p-6 space-y-4">
            {status === 'idle' && (
              <form onSubmit={handlePayment} className="space-y-3">
                <h2 className="text-lg font-semibold">Buy “{selectedBook.title}”</h2>
                <p className="text-sm text-gray-600">{selectedBook.description}</p>
                <p className="text-sm font-medium text-green-700">Members get 20% off any book</p>
                <p className="text-xs text-gray-500">
                  Your book will be emailed to you within seconds after successful payment.
                </p>
                <p className="text-xs text-gray-500">
                  Need help? Contact <span className="font-medium">info@masterwriters.org</span>
                </p>

                <input
                  type="tel"
                  required
                  placeholder="Enter phone number (2547xxxxxxx)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-md p-2"
                />

                <button
                  type="submit"
                  className="w-full bg-[#FF7A00] text-white py-2 rounded-md"
                >
                  Pay Ksh {selectedBook.price}
                </button>
              </form>
            )}

            {status === 'processing' && <p className="text-center">Processing payment…</p>}

            {status === 'success' && (
              <div className="text-center space-y-2">
                <p className="font-semibold">STK Push sent ✅</p>
                <p>Check your phone to complete payment.</p>
                <p className="text-sm text-gray-600">
                  Your book will arrive in your email inbox shortly.
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-1">
                <p className="text-red-600 font-semibold">Payment failed.</p>
                <p className="text-sm text-gray-600">{errorMessage}</p>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedBook(null);
                setPhone('');
                setStatus('idle');
                setErrorMessage('');
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
