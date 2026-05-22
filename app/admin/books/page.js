'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, X, Upload, BookOpen, CheckCircle, Loader2, ImageIcon, FileText, AlertCircle } from 'lucide-react';

const emptyForm = { title: '', description: '', price: '', isFree: false };

function FileDropzone({ label, accept, icon: Icon, file, onFile, hint }) {
  const ref = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onClick={() => ref.current?.click()}
      className={`border-2 border-dashed rounded-xl p-5 cursor-pointer transition flex flex-col items-center gap-2 text-center
        ${dragging ? 'border-orange-400 bg-orange-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'}`}
    >
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => onFile(e.target.files[0])} />
      {file ? (
        <>
          <CheckCircle size={28} className="text-green-500" />
          <p className="text-sm font-semibold text-green-700 truncate max-w-full">{file.name}</p>
          <p className="text-xs text-green-600">{(file.size / 1024 / 1024).toFixed(1)} MB · Click to change</p>
        </>
      ) : (
        <>
          <Icon size={28} className="text-gray-400" />
          <p className="text-sm font-semibold text-gray-600">{label}</p>
          {hint && <p className="text-xs text-gray-400">{hint}</p>}
          <p className="text-xs text-gray-400">Drag & drop or click to browse</p>
        </>
      )}
    </div>
  );
}

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploadStage, setUploadStage] = useState('idle'); // idle | uploading | saving | done | error
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadError, setUploadError] = useState('');

  const load = () => {
    fetch('/api/admin/books')
      .then(r => r.json())
      .then(d => { setBooks(d.books || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: val }));
  };

  const reset = () => {
    setForm(emptyForm);
    setPdfFile(null);
    setCoverFile(null);
    setUploadStage('idle');
    setUploadProgress('');
    setUploadError('');
    setShowForm(false);
  };

  const upload = async () => {
    if (!form.title) { setUploadError('Title is required.'); return; }
    if (!pdfFile) { setUploadError('Please select a PDF file.'); return; }
    if (!coverFile) { setUploadError('Please select a cover image.'); return; }
    if (!form.isFree && !form.price) { setUploadError('Please enter a price or mark as free.'); return; }

    setUploadStage('uploading');
    setUploadError('');

    try {
      // Step 1: Upload files through the server (avoids CORS)
      setUploadProgress('Uploading files to Cloudflare R2...');
      const fd = new FormData();
      fd.append('pdf', pdfFile);
      fd.append('cover', coverFile);

      const uploadRes = await fetch('/api/admin/books/upload', {
        method: 'POST',
        body: fd,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'File upload failed.');

      const { pdfKey, coverKey } = uploadData;

      // Step 2: Save book record in database
      setUploadStage('saving');
      setUploadProgress('Saving book details...');
      const bookRes = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pdfKey, coverKey }),
      });
      const bookData = await bookRes.json();
      if (!bookRes.ok) throw new Error(bookData.error || 'Failed to save book.');

      setUploadStage('done');
      setUploadProgress('Book published successfully!');
      load();
      setTimeout(reset, 2000);

    } catch (err) {
      setUploadStage('error');
      setUploadError(err.message);
    }
  };

  const deleteBook = async (id, title) => {
    if (!confirm(`Delete "${title}"? This will also remove the PDF and cover from Cloudflare R2.`)) return;
    await fetch(`/api/admin/books/${id}`, { method: 'DELETE' });
    load();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={26} className="animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Books</h1>
          <p className="text-sm text-gray-500">{books.length} books in catalog</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF7A00] text-white rounded-lg hover:bg-[#e56d00] text-sm font-semibold transition"
        >
          <Plus size={16} /> Add Book
        </button>
      </div>

      {/* Upload form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-lg">Add New Book</h2>
              <button onClick={reset}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
            </div>

            {/* Upload progress */}
            {uploadStage === 'uploading' || uploadStage === 'saving' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4">
                <Loader2 size={28} className="animate-spin text-blue-500 shrink-0" />
                <div>
                  <p className="font-semibold text-blue-800">Uploading...</p>
                  <p className="text-sm text-blue-600">{uploadProgress}</p>
                </div>
              </div>
            ) : uploadStage === 'done' ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-3">
                <CheckCircle size={24} className="text-green-500" />
                <p className="font-semibold text-green-700">{uploadProgress}</p>
              </div>
            ) : (
              <>
                {/* Book details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Book Title *</label>
                    <input value={form.title} onChange={set('title')} placeholder="e.g. The Art of Academic Writing"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                    <textarea value={form.description} onChange={set('description')} rows={3}
                      placeholder="Brief description of what readers will learn..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Price (KES)</label>
                    <input type="number" min="0" value={form.price} onChange={set('price')} placeholder="e.g. 500"
                      disabled={form.isFree}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-40 disabled:bg-gray-50" />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-3 cursor-pointer mt-4">
                      <div className="relative">
                        <input type="checkbox" checked={form.isFree} onChange={set('isFree')} className="sr-only" />
                        <div className={`w-10 h-6 rounded-full transition ${form.isFree ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isFree ? 'translate-x-5' : 'translate-x-1'}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Free book</span>
                    </label>
                  </div>
                </div>

                {/* File uploads */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FileDropzone
                    label="Upload PDF"
                    accept=".pdf"
                    icon={FileText}
                    file={pdfFile}
                    onFile={setPdfFile}
                    hint="PDF format · Max 50 MB"
                  />
                  <FileDropzone
                    label="Upload Cover Image"
                    accept="image/*"
                    icon={ImageIcon}
                    file={coverFile}
                    onFile={setCoverFile}
                    hint="JPG, PNG, or WebP · Recommended 400×600"
                  />
                </div>

                {uploadError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                    <AlertCircle size={16} /> {uploadError}
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <button onClick={reset} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                  <button
                    onClick={upload}
                    className="flex items-center gap-2 px-6 py-2 bg-[#FF7A00] text-white text-sm font-semibold rounded-lg hover:bg-[#e56d00] transition"
                  >
                    <Upload size={15} /> Upload & Publish
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Books grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {books.map(book => {
          const coverUrl = book.coverKey
            ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''}/${book.coverKey}`
            : null;
          return (
            <div key={book.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group">
              {/* Cover */}
              <div className="aspect-[2/3] bg-gray-100 relative overflow-hidden">
                {coverUrl ? (
                  <img src={coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={40} className="text-gray-300" />
                  </div>
                )}
                {book.isFree && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">FREE</span>
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{book.title}</h3>
                {book.description && <p className="text-xs text-gray-500 line-clamp-2">{book.description}</p>}
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${book.isFree ? 'text-green-600' : 'text-[#FF7A00]'}`}>
                    {book.isFree ? 'Free' : `KES ${book.price}`}
                  </span>
                  <button
                    onClick={() => deleteBook(book.id, book.title)}
                    className="text-red-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                {/* Download count */}
                <div className="flex items-center gap-1 text-xs text-gray-400 border-t border-gray-100 pt-2">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span className="font-semibold text-gray-600">{book.downloadCount || 0}</span>
                  <span>download{(book.downloadCount || 0) !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          );
        })}

        {books.length === 0 && (
          <div className="col-span-4 text-center py-16">
            <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No books yet. Click &quot;Add Book&quot; to publish your first one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
