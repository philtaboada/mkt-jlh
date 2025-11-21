import { randomUUID } from 'node:crypto';
import { bucket } from './gcp';

export async function uploadFile(buffer: Buffer, mime: string, folder = 'marketing/uploads') {
  const ext = mime.split('/')[1] || 'bin';
  const filename = `${folder}/${randomUUID()}.${ext}`;

  const file = bucket.file(filename);

  await file.save(buffer, {
    metadata: { contentType: mime },
    public: true,
    gzip: true,
    resumable: false,
  });

  return {
    filename,
    url: `https://storage.googleapis.com/${bucket.name}/${filename}`,
  };
}

export async function deleteFile(filename: string) {
  try {
    await bucket.file(filename).delete();
    return true;
  } catch (err: any) {
    if (err.code === 404) return false;
    throw err;
  }
}

export function getPublicUrl(filename: string) {
  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}
