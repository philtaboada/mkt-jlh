import { uploadFile } from './gcp.actions';

export async function downloadAndUploadMedia(mediaId: string, type: string) {
  const token = process.env.WHATSAPP_TOKEN!;

  const urlRes = await fetch(`https://graph.facebook.com/v20.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meta = await urlRes.json();
  if (!meta.url) return null;

  const fileRes = await fetch(meta.url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const buffer = Buffer.from(await fileRes.arrayBuffer());
  const mime = fileRes.headers.get('content-type') || 'application/octet-stream';

  const uploaded = await uploadFile(buffer, mime, 'whatsapp/media');

  return {
    url: uploaded.url,
    mime,
    id: mediaId,
    size: buffer.length,
  };
}
