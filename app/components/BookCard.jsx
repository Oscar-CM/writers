import { useState, useEffect } from 'react';
import BuyBookForm from './BuyBookForm';
import { supabase } from '../../lib/supabaseClient';


export default function BookCard({ book }) {
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleGetDownload = async () => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch('/api/books/download', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookId: book.id }),
    });

    const data = await res.json();
    if (res.ok) setDownloadUrl(data.downloadUrl);
    else alert(data.error);
  };

  return (
    <div className="border p-4 rounded space-y-2">
      <img src={book.cover_url} alt={book.title} className="w-full h-48 object-cover" />
      <h3 className="font-bold">{book.title}</h3>
      <p>{book.description}</p>
      <p className="font-semibold">KES {book.price}</p>

      {downloadUrl ? (
        <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          Download Now
        </a>
      ) : (
        <BuyBookForm book={book} />
      )}
    </div>
  );
}
