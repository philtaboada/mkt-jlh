'use server';

import { uploadFile } from '@/lib/storage/gcp.actions';

export interface UploadResult {
  url: string;
  mime: string;
  size: number;
  name: string;
  filename: string;
}

function getBaseMimeType(params: { mime: string }): string {
  return params.mime.split(';')[0].trim();
}

export async function uploadChatAttachment(formData: FormData): Promise<UploadResult> {
  const file = formData.get('file') as File;
  
  if (!file) {
    throw new Error('No se proporcionó ningún archivo');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = getBaseMimeType({ mime: file.type || 'application/octet-stream' });
  
  // Usar la carpeta 'mkt-chat' como solicitó el usuario
  const result = await uploadFile(buffer, mime, 'mkt-chat');

  return {
    url: result.url,
    mime,
    size: file.size,
    name: file.name,
    filename: result.filename,
  };
}
