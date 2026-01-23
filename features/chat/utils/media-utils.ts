/**
 * Utilidades para manejar tipos de media en mensajes
 */

const SUPPORTED_WHATSAPP_IMAGE_MIMES = ['image/jpeg', 'image/png'] as const;
const SUPPORTED_WHATSAPP_AUDIO_MIMES = ['audio/mpeg', 'audio/ogg', 'audio/aac'] as const;
const SUPPORTED_WHATSAPP_VIDEO_MIMES = ['video/mp4', 'video/3gpp'] as const;

export function resolveMediaType(params: { mime: string }): 'image' | 'video' | 'audio' | 'file' {
  if (params.mime.startsWith('image/')) {
    return SUPPORTED_WHATSAPP_IMAGE_MIMES.includes(params.mime as (typeof SUPPORTED_WHATSAPP_IMAGE_MIMES)[number])
      ? 'image'
      : 'file';
  }
  if (params.mime.startsWith('video/')) {
    return SUPPORTED_WHATSAPP_VIDEO_MIMES.includes(params.mime as (typeof SUPPORTED_WHATSAPP_VIDEO_MIMES)[number])
      ? 'video'
      : 'file';
  }
  if (params.mime.startsWith('audio/')) {
    return SUPPORTED_WHATSAPP_AUDIO_MIMES.includes(params.mime as (typeof SUPPORTED_WHATSAPP_AUDIO_MIMES)[number])
      ? 'audio'
      : 'file';
  }
  return 'file';
}

export function resolveWhatsAppType(params: { type: 'image' | 'video' | 'audio' | 'file' }): 'image' | 'video' | 'audio' | 'document' {
  if (params.type === 'file') return 'document';
  return params.type;
}
