'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, BookOpen, Download, Smartphone, Loader2, CheckCircle, X, SlidersHorizontal, Info } from 'lucide-react';

const POLL_INTERVAL = 5000;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'title', label: 'A – Z' },
];

const PRICE_FILTERS = [
  { value: 'all', label: 'All Books' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  // Payment modal state
  const [selected, setSelected] = useState(null); // book being purchased
  const [access, setAccess] = useState({}); // { [bookId]: true/false }
  const [phone, setPhone] = useState('');
  const [payStage, setPayStage] = useState('idle'); // idle | sending | waiting | done | failed
  const [payMsg, setPayMsg] = useState('');
  const [txId, setTxId] = useState(null);
  const [purchaseId, setPurchaseId] = useState(null);
  const [downloading, setDownloading] = useState(null); // bookId being downloaded
  const [preview, setPreview] = useState(null); // book being previewed in overlay

  const loadBooks = useCallback(() => {
    const params = new URLSearchParams({ search, filter, sort });
    setLoading(true);
    fetch(`/api/books?${params}`)
      .then(r => r.json())
      .then(d => { setBooks(d.books || []); setLoading(false); });
  }, [search, filter, sort]);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  // Load access status for all books
  useEffect(() => {
    books.forEach(book => {
      if (access[book.id] !== undefined) return; // already checked
      fetch(`/api/books/${book.id}/access`)
        .then(r => r.json())
        .then(d => setAccess(prev => ({ ...prev, [book.id]: d.hasAccess })));
    });
  }, [books]);

  // Poll for payment after STK push
  useEffect(() => {
    if (payStage !== 'waiting' || !txId) return;
    const interval = setInterval(async () => {
      const res = await fetch('/api/pay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionRequestId: txId, purchaseId }),
      });
      const d = await res.json();
      if (d.status === 'COMPLETED') {
        clearInterval(interval);
        setPayStage('done');
        setAccess(prev => ({ ...prev, [selected.id]: true }));
      } else if (d.status === 'FAILED') {
        clearInterval(interval);
        setPayStage('failed');
        setPayMsg('Payment was not completed. Please try again.');
      }
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [payStage, txId, purchaseId, selected]);

  const openPayment = (book) => {
    setSelected(book);
    setPayStage('idle');
    setPayMsg('');
    setPhone('');
    setTxId(null);
    setPurchaseId(null);
  };

  const closeModal = () => {
    setSelected(null);
    setPayStage('idle');
  };

  const initiatePayment = async () => {
    let p = phone.trim().replace(/\s+/g, '');
    if (p.startsWith('0')) p = '254' + p.slice(1);
    else if (p.startsWith('+')) p = p.slice(1);
    if (!/^254\d{9}$/.test(p)) {
      setPayMsg('Enter a valid number: 07XXXXXXXX or 2547XXXXXXXX');
      return;
    }

    setPayStage('sending');
    setPayMsg('');

    const res = await fetch('/api/pay/stk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: p,
        productType: 'book',
        overrideAmount: parseFloat(selected.price),
      }),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      setPayStage('failed');
      setPayMsg(data.error || 'STK push failed. Please try again.');
      // Also need to save productId for the purchase
      return;
    }

    // Save productId on this specific purchase
    await fetch(`/api/pay/set-product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchaseId: data.purchaseId, productId: selected.id }),
    }).catch(() => {}); // best effort

    setTxId(data.transactionRequestId);
    setPurchaseId(data.purchaseId);
    setPayStage('waiting');
  };

  const downloadBook = async (bookId) => {
    setDownloading(bookId);
    // Navigate to download URL — server checks access and redirects to R2 presigned URL
    window.location.href = `/api/books/${bookId}/download`;
    setTimeout(() => setDownloading(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Books</h1>
        <p className="text-sm text-gray-500 mt-0.5">Premium writing resources and guides</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search books..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {PRICE_FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition
                ${filter === f.value ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-gray-400" />
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Books grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-gray-300" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">{search ? `No books matching "${search}"` : 'No books available.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map(book => {
            const hasPurchased = access[book.id];
            const canDownload = book.isFree || hasPurchased;
            const coverUrl = book.coverPublicUrl;

            return (
              <div key={book.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                {/* Cover — click to preview */}
                <div className="aspect-[2/3] bg-gray-100 relative overflow-hidden cursor-pointer"
                  onClick={() => setPreview(book)}>
                  {coverUrl ? (
                    <img src={coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-50 to-amber-100">
                      <BookOpen size={32} className="text-orange-300" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <Info size={12} /> View Details
                    </span>
                  </div>
                  {/* Badge */}
                  <div className="absolute top-2 left-2">
                    {book.isFree ? (
                      <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">FREE</span>
                    ) : hasPurchased ? (
                      <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">OWNED</span>
                    ) : null}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 space-y-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{book.title}</h3>

                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${book.isFree ? 'text-green-600' : 'text-[#FF7A00]'}`}>
                      {book.isFree ? 'Free' : `KES ${book.price}`}
                    </span>
                  </div>

                  {canDownload ? (
                    <button
                      onClick={() => downloadBook(book.id)}
                      disabled={downloading === book.id}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-60"
                    >
                      {downloading === book.id
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Download size={13} />}
                      Download
                    </button>
                  ) : (
                    <button
                      onClick={() => openPayment(book)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#FF7A00] hover:bg-[#e56d00] text-white text-xs font-bold rounded-lg transition"
                    >
                      <Smartphone size={13} />
                      Buy — KES {book.price}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Preview Overlay */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex">
              {/* Cover */}
              <div className="w-36 shrink-0 bg-gray-100">
                {preview.coverPublicUrl
                  ? <img src={preview.coverPublicUrl} alt={preview.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full min-h-[180px] flex items-center justify-center bg-linear-to-br from-orange-50 to-amber-100">
                      <BookOpen size={28} className="text-orange-300" />
                    </div>}
              </div>
              {/* Details */}
              <div className="flex-1 p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${preview.isFree ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-[#FF7A00]'}`}>
                    {preview.isFree ? 'FREE' : `KES ${preview.price}`}
                  </span>
                  <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
                <h2 className="font-bold text-gray-900 text-base leading-snug">{preview.title}</h2>
                {preview.description && (
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{preview.description}</p>
                )}
                <div className="pt-1">
                  {(preview.isFree || access[preview.id]) ? (
                    <button onClick={() => { setPreview(null); downloadBook(preview.id); }}
                      disabled={downloading === preview.id}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition disabled:opacity-60">
                      {downloading === preview.id ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                      Download
                    </button>
                  ) : (
                    <button onClick={() => { setPreview(null); openPayment(preview); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FF7A00] hover:bg-[#e56d00] text-white text-sm font-bold rounded-xl transition">
                      <Smartphone size={15} /> Buy — KES {preview.price}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

            {/* Book header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50">
              {selected.coverPublicUrl && (
                <img src={selected.coverPublicUrl} alt={selected.title} className="w-12 h-16 object-cover rounded-lg shadow-sm" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{selected.title}</p>
                <p className="text-[#FF7A00] font-bold text-base mt-0.5">KES {selected.price}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 self-start">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Idle: enter phone */}
              {payStage === 'idle' && (
                <>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Pay via M-Pesa</p>
                    <p className="text-xs text-gray-500">Enter your Safaricom number. You'll receive an STK push to complete the payment.</p>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="07XXXXXXXX or 2547XXXXXXXX"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  {payMsg && <p className="text-xs text-red-600">{payMsg}</p>}
                  <button
                    onClick={initiatePayment}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <Smartphone size={16} /> Pay KES {selected.price}
                  </button>
                </>
              )}

              {/* Sending */}
              {payStage === 'sending' && (
                <div className="text-center py-4 space-y-3">
                  <Loader2 size={36} className="animate-spin text-[#FF7A00] mx-auto" />
                  <p className="font-semibold text-gray-700">Sending STK push...</p>
                </div>
              )}

              {/* Waiting for PIN */}
              {payStage === 'waiting' && (
                <div className="text-center py-4 space-y-3">
                  <div className="text-4xl">📱</div>
                  <p className="font-bold text-gray-800">Check Your Phone</p>
                  <p className="text-sm text-gray-600">Enter your <strong>M-Pesa PIN</strong> to pay <strong>KES {selected.price}</strong></p>
                  <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                    <Loader2 size={14} className="animate-spin" />
                    Waiting for confirmation...
                  </div>
                  <p className="text-xs text-gray-400">Do not close this window.</p>
                </div>
              )}

              {/* Success */}
              {payStage === 'done' && (
                <div className="text-center py-4 space-y-3">
                  <CheckCircle size={48} className="text-green-500 mx-auto" />
                  <p className="font-bold text-gray-800 text-lg">Payment confirmed!</p>
                  <p className="text-sm text-gray-600">"{selected.title}" is now in your library.</p>
                  <button
                    onClick={() => { closeModal(); }}
                    className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
                  >
                    Download Book
                  </button>
                </div>
              )}

              {/* Failed */}
              {payStage === 'failed' && (
                <div className="text-center py-4 space-y-3">
                  <div className="text-4xl">❌</div>
                  <p className="font-bold text-gray-800">Payment failed</p>
                  <p className="text-sm text-gray-500">{payMsg}</p>
                  <button onClick={() => setPayStage('idle')} className="text-sm text-[#FF7A00] hover:underline">Try again</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
