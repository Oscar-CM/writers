'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AddBook() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [pdf, setPdf] = useState(null);
  const [cover, setCover] = useState(null);
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!pdf || !cover) return alert('Please select both PDF and cover');

  setLoading(true);

  try {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    // Upload PDF
    const pdfPath = `pdfs/${slug}.pdf`;
    const { error: pdfError } = await supabase.storage
      .from('books')
      .upload(pdfPath, pdf, { upsert: true, contentType: 'application/pdf' });
    if (pdfError) throw pdfError;

    // Upload Cover
    const ext = cover.name.split('.').pop();
    const coverPath = `covers/${slug}.${ext}`;
    const { error: coverError } = await supabase.storage
      .from('covers')
      .upload(coverPath, cover, { upsert: true, contentType: cover.type });
    if (coverError) throw coverError;

    // ✅ FIXED: Get public URL correctly
    const { data: { publicUrl: coverURL } } = supabase.storage
      .from('covers')
      .getPublicUrl(coverPath);

    // Send to API
    const res = await fetch('/api/books/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        price: Number(price),
        pdf_path: pdfPath,
        cover_url: coverURL, // This will now have the actual URL
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create book');

    alert('Book added successfully!');
    // Reset form
    setTitle('');
    setDescription('');
    setPrice('');
    setPdf(null);
    setCover(null);
  } catch (err) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <h2 className="text-xl font-bold">Add Book</h2>

      <input
        placeholder="Title"
        className="w-full border p-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="Description"
        className="w-full border p-2"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="number"
        placeholder="Price"
        className="w-full border p-2"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      {/* PDF Upload */}
      <div>
        <label className="block font-semibold mb-1">PDF File (Book Content)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdf(e.target.files[0])}
          required
        />
        {pdf && <p className="text-sm text-gray-600 mt-1">Selected PDF: {pdf.name}</p>}
      </div>

      {/* Cover Upload */}
      <div>
        <label className="block font-semibold mb-1">Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCover(e.target.files[0])}
          required
        />
        {cover && <p className="text-sm text-gray-600 mt-1">Selected Cover: {cover.name}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-4 py-2"
      >
        {loading ? 'Uploading...' : 'Save Book'}
      </button>
    </form>
  );
}
