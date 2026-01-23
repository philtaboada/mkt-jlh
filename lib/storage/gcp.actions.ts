import { randomUUID } from 'node:crypto';
import { getStorage } from './gcp';

function getBaseMimeType(params: { mime: string }): string {
  return params.mime.split(';')[0].trim();
}

function resolveExtension(params: { mime: string }): string {
  const baseMime = getBaseMimeType({ mime: params.mime });
  const extensionMap: Record<string, string> = {
    // Imágenes
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
    'image/svg+xml': 'svg',
    'image/x-icon': 'ico',
    'image/vnd.microsoft.icon': 'ico',
    // Audio (formatos soportados por WhatsApp)
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/ogg': 'ogg',
    'audio/opus': 'opus',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/aac': 'aac',
    'audio/amr': 'amr',
    'audio/mp4': 'm4a',
    'audio/x-m4a': 'm4a',
    'audio/webm': 'weba',
    // Video
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/3gpp': '3gp',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    // Documentos
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'text/plain': 'txt',
    'text/csv': 'csv',
    'application/json': 'json',
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
  };
  
  // Si está en el mapa, usar la extensión mapeada
  if (extensionMap[baseMime]) {
    return extensionMap[baseMime];
  }
  
  // Si no está en el mapa, intentar extraer una extensión válida del MIME
  const subType = baseMime.split('/')[1];
  if (subType) {
    // Limpiar prefijos comunes como 'x-', 'vnd.', etc.
    const cleanExt = subType.replace(/^(x-|vnd\.)/, '').split('+')[0].split('.').pop();
    if (cleanExt && cleanExt.length <= 5 && /^[a-z0-9]+$/i.test(cleanExt)) {
      return cleanExt;
    }
  }
  
  return 'bin';
}

export async function uploadFile(buffer: Buffer, mime: string, folder = 'marketing/uploads') {
  try {
    const { bucket } = getStorage();
    
    if (!bucket) {
      throw new Error('GCP bucket no está configurado. Verifica las variables de entorno GCP_BUCKET_NAME y las credenciales.');
    }

    const safeMime = getBaseMimeType({ mime });
    const ext = resolveExtension({ mime: safeMime });
    const filename = `${folder}/${randomUUID()}.${ext}`;

    const file = bucket.file(filename);

    await file.save(buffer, {
      metadata: { contentType: safeMime },
      public: true,
      gzip: true,
      resumable: false,
    });

    return {
      filename,
      url: `https://storage.googleapis.com/${bucket.name}/${filename}`,
    };
  } catch (error) {
    console.error('[uploadFile] Error:', error);
    if (error instanceof Error) {
      throw new Error(`Error al subir archivo a GCP: ${error.message}`);
    }
    throw error;
  }
}

export async function deleteFile(filename: string) {
  try {
    const { bucket } = getStorage();
    if (!bucket) {
      throw new Error('GCP bucket no está configurado');
    }
    await bucket.file(filename).delete();
    return true;
  } catch (err: any) {
    if (err.code === 404) return false;
    throw err;
  }
}

export function getPublicUrl(filename: string) {
  try {
    const { bucket } = getStorage();
    if (!bucket) {
      throw new Error('GCP bucket no está configurado');
    }
    return `https://storage.googleapis.com/${bucket.name}/${filename}`;
  } catch (error) {
    console.error('[getPublicUrl] Error:', error);
    throw error;
  }
}
