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
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No se proporcionó ningún archivo');
    }

    if (!file.size || file.size === 0) {
      throw new Error('El archivo está vacío');
    }

    // Validar tamaño máximo (100MB)
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
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
  } catch (error) {
    console.error('[uploadChatAttachment] Error:', error);
    
    // Proporcionar mensajes de error más descriptivos
    if (error instanceof Error) {
      // Si es un error de GCP, proporcionar más contexto
      if (error.message.includes('GCP') || error.message.includes('bucket') || error.message.includes('storage')) {
        throw new Error(`Error de almacenamiento: ${error.message}. Verifica la configuración de GCP.`);
      }
      throw error;
    }
    
    throw new Error('Error desconocido al subir el archivo');
  }
}
