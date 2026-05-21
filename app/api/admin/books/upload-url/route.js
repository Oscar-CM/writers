import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUploadUrl } from '@/lib/r2';
import { v4 as uuidv4 } from 'uuid';

function safeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { pdfName, coverName } = await req.json();

  if (!pdfName || !coverName) {
    return NextResponse.json({ error: 'pdfName and coverName are required.' }, { status: 400 });
  }

  const id = uuidv4();
  const pdfKey = `books/${id}-${safeFileName(pdfName)}`;
  const coverKey = `covers/${id}-${safeFileName(coverName)}`;

  // Determine content type for cover from file extension
  const ext = coverName.split('.').pop().toLowerCase();
  const coverContentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const [pdfUploadUrl, coverUploadUrl] = await Promise.all([
    getUploadUrl(pdfKey, 'application/pdf'),
    getUploadUrl(coverKey, coverContentType),
  ]);

  return NextResponse.json({ pdfKey, coverKey, pdfUploadUrl, coverUploadUrl });
}
