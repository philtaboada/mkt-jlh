import { uploadFile } from './gcp.actions';
import { getChannelsByType } from '@/features/chat/api/channels.api';
import type {
  ChannelConfig,
  WhatsAppConfig,
  FacebookConfig,
  InstagramConfig,
} from '@/features/chat/types/settings';

function getAccessToken(config: ChannelConfig): string | undefined {
  if ('access_token' in config) {
    return (config as WhatsAppConfig | InstagramConfig).access_token;
  }
  if ('page_access_token' in config) {
    return (config as FacebookConfig).page_access_token;
  }
  return undefined;
}

export async function downloadAndUploadMedia(mediaId: string, type: string) {
  const channels = await getChannelsByType(type);
  const activeChannel = channels.find((ch) => ch.status === 'active');

  if (!activeChannel) {
    throw new Error(`No active ${type} channel found`);
  }

  const config = activeChannel.config;
  const token = getAccessToken(config);

  if (!token) {
    throw new Error(`Access token not configured for ${type} channel`);
  }

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

  const uploaded = await uploadFile(buffer, mime, `${type}/media`);

  return {
    url: uploaded.url,
    mime,
    id: mediaId,
    size: buffer.length,
  };
}
