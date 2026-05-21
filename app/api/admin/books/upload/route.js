import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { r2, R2_BUCKET } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

function safeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const pdfFile = formData.get('pdf');
    const coverFile = formData.get('cover');

    if (!pdfFile || !coverFile) {
      return NextResponse.json({ error: 'Both PDF and cover image are required.' }, { status: 400 });
    }

    const id = uuidv4();
    const pdfKey = `books/${id}-${safeFileName(pdfFile.name)}`;
    const coverKey = `covers/${id}-${safeFileName(coverFile.name)}`;

    // Determine cover content type
    const coverExt = coverFile.name.split('.').pop().toLowerCase();
    const coverContentType =
      coverExt === 'png' ? 'image/png'
      : coverExt === 'webp' ? 'image/webp'
      : 'image/jpeg';

    // Convert files to ArrayBuffer then Uint8Array for R2
    const [pdfBuffer, coverBuffer] = await Promise.all([
      pdfFile.arrayBuffer(),
      coverFile.arrayBuffer(),
    ]);

    // Upload both files to R2
    await Promise.all([
      r2.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: pdfKey,
        Body: new Uint8Array(pdfBuffer),
        ContentType: 'application/pdf',
      })),
      r2.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: coverKey,
        Body: new Uint8Array(coverBuffer),
        ContentType: coverContentType,
      })),
    ]);

    return NextResponse.json({ pdfKey, coverKey });

  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed.' }, { status: 500 });
  }
}
