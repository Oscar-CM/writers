import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME;

// Generate a presigned URL for uploading (PUT)
export async function getUploadUrl(key, contentType, expiresIn = 3600) {
  return getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn }
  );
}

// Generate a presigned URL for downloading (GET) — 15 min default
export async function getDownloadUrl(key, expiresIn = 900) {
  return getSignedUrl(
    r2,
    new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }),
    { expiresIn }
  );
}

// Delete an object from R2
export async function deleteObject(key) {
  return r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}

// Public cover URL (only works if R2 bucket has public access enabled)
export function publicCoverUrl(key) {
  if (!key) return null;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!base) return null;
  return `${base}/${key}`;
}
