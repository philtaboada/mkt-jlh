import { uploadFile } from './gcp.actions';
import { getChannelsByType } from '@/features/chat/api/channels.api';
import type {
  ChannelConfig,
  WhatsAppConfig,
  MessengerConfig,
  InstagramConfig,
} from '@/features/chat/types/settings';

type ChannelType = 'whatsapp' | 'messenger' | 'instagram';
type MediaType = 'image' | 'audio' | 'video' | 'document' | 'sticker';

function getAccessToken(config: ChannelConfig): string | undefined {
  if ('access_token' in config) {
    return (config as WhatsAppConfig | InstagramConfig).access_token;
  }
  if ('page_access_token' in config) {
    return (config as MessengerConfig).page_access_token;
  }
  return undefined;
}

interface DownloadMediaParams {
  mediaId: string;
  mediaType: MediaType;
  channelType: ChannelType;
}

/**
 * Descarga media desde la API de Meta y la sube a GCS
 * @param mediaId - ID del media en la API de Meta
 * @param mediaType - Tipo de media (image, audio, video, document, sticker)
 * @param channelType - Tipo de canal (whatsapp, facebook, instagram)
 */
export async function downloadAndUploadMedia(
  mediaId: string,
  mediaType: MediaType | string,
  channelType: ChannelType = 'whatsapp'
) {
  console.info('[media-download] starting', { mediaId, mediaType, channelType });
  
  const channels = await getChannelsByType(channelType);
  const activeChannel = channels.find((ch) => ch.status === 'active');

  if (!activeChannel) {
    console.error('[media-download] no active channel', { channelType });
    throw new Error(`No active ${channelType} channel found`);
  }

  const config = activeChannel.config;
  const token = getAccessToken(config);

  if (!token) {
    console.error('[media-download] no access token', { channelType });
    throw new Error(`Access token not configured for ${channelType} channel`);
  }

  const urlRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.info('[media-download] meta response', {
    mediaId,
    mediaType,
    channelType,
    status: urlRes.status,
  });
  
  if (!urlRes.ok) {
    const errorText = await urlRes.text();
    console.error('[media-download] meta API error', {
      mediaId,
      status: urlRes.status,
      error: errorText,
    });
    throw new Error(`Failed to get media URL from Meta API: ${urlRes.status}`);
  }
  
  const meta = await urlRes.json();
  console.info('[media-download] meta payload', {
    mediaId,
    mediaType,
    hasUrl: Boolean(meta.url),
    mime: meta.mime_type,
    fileSize: meta.file_size,
  });
  
  if (!meta.url) {
    console.error('[media-download] no URL in meta response', { mediaId, meta });
    return null;
  }

  const fileRes = await fetch(meta.url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.info('[media-download] file response', {
    mediaId,
    mediaType,
    status: fileRes.status,
    contentType: fileRes.headers.get('content-type'),
  });

  if (!fileRes.ok) {
    console.error('[media-download] file download error', {
      mediaId,
      status: fileRes.status,
    });
    throw new Error(`Failed to download media file: ${fileRes.status}`);
  }

  const buffer = Buffer.from(await fileRes.arrayBuffer());
  const mime = fileRes.headers.get('content-type') || meta.mime_type || 'application/octet-stream';

  const uploaded = await uploadFile(buffer, mime, `mkt-chat/${mediaType}`);

  console.info('[media-download] upload success', {
    mediaId,
    mediaType,
    url: uploaded.url,
    mime,
    size: buffer.length,
  });

  return {
    url: uploaded.url,
    mime,
    id: mediaId,
    size: buffer.length,
  };
}
