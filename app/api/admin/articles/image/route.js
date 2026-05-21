import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { r2, R2_BUCKET, publicCoverUrl } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get('image');
  if (!file) return NextResponse.json({ error: 'No image provided.' }, { status: 400 });

  const ext = file.name.split('.').pop().toLowerCase();
  const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/gif' ? 'image/gif' : 'image/jpeg';
  const key = `articles/${uuidv4()}.${ext}`;

  const buffer = await file.arrayBuffer();
  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: new Uint8Array(buffer),
    ContentType: contentType,
  }));

  return NextResponse.json({ key, url: publicCoverUrl(key) });
}
