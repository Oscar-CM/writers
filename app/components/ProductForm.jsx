'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default function ProductsForm() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState('draft');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const categories = [
    { id: 'ebooks', name: 'Ebooks' },
    { id: 'templates', name: 'Templates' },
    { id: 'courses', name: 'Courses' },
  ];

  // Auto-generate slug
  useEffect(() => {
    if (name) {
      setSlug(
        name
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '')
      );
    }
  }, [name]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) return alert('Please upload a file.');

    setUploading(true);

    try {
      // 1️⃣ Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Prepare tags array
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      // 2️⃣ Send data to SERVER ROUTE
      const res = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          price: parseInt(price),
          category_id: categoryId || null,
          featured,
          status,
          file_key: filePath,
          tags,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');

      alert('Product created successfully!');

      // Reset form
      setName('');
      setSlug('');
      setDescription('');
      setPrice('');
      setCategoryId('');
      setTagsInput('');
      setFeatured(false);
      setStatus('draft');
      setFile(null);
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }

    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-2xl font-bold">Create Product</h2>

      <input
        type="text"
        placeholder="Product Name"
        className="w-full border p-2 rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <p className="text-sm text-gray-500">
        Slug (auto): <strong>{slug}</strong>
      </p>

      <textarea
        placeholder="Description"
        className="w-full border p-2 rounded"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>

      <input
        type="number"
        placeholder="Price (Ksh)"
        className="w-full border p-2 rounded"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <select
        className="w-full border p-2 rounded"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      >
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Tags (comma separated)"
        className="w-full border p-2 rounded"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
        />
        <span>Featured</span>
      </label>

      <select
        className="w-full border p-2 rounded"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>

      <input
        type="file"
        className="w-full border p-2 rounded"
        accept=".pdf,.zip,.docx"
        onChange={(e) => setFile(e.target.files[0])}
        required
      />

      <button
        type="submit"
        className="w-full bg-orange-500 text-white py-2 rounded"
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Create Product'}
      </button>
    </form>
  );
}
