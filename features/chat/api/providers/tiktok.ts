import type { Channel, TikTokConfig } from '@/features/chat/types/settings';
import { getChannelsByType } from '../channels.api';
import { sendTikTokMessage } from '@/lib/services';

export interface TikTokSendRequest {
  to: string;
  type?: 'text' | 'image' | 'video' | 'file';
  message?: string;
  mediaUrl?: string;
  caption?: string;
}

export async function sendTikTok(req: TikTokSendRequest) {
  const { to, type = 'text', message, mediaUrl, caption } = req;

  if (!to) throw new Error('Missing required field: to (TikTok user id)');
  if (type === 'text' && !message) throw new Error('Message text is required for text messages');
  if (type !== 'text' && !mediaUrl) throw new Error(`mediaUrl is required for ${type} messages`);

  const tiktokChannels: Channel[] = await getChannelsByType('tiktok');
  const activeChannel = tiktokChannels.find((ch) => ch.status === 'active');

  if (!activeChannel) {
    throw new Error('No active TikTok channel found');
  }

  const config = activeChannel.config as TikTokConfig;
  const accessToken = config?.access_token;

  if (!accessToken) {
    throw new Error('TikTok channel is not properly configured (missing access token)');
  }

  const result = await sendTikTokMessage({
    to,
    message,
    type,
    mediaUrl,
    caption,
    accessToken,
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to send TikTok message');
  }

  return {
    success: true,
    messageId: result.messageId,
    to,
    channelId: activeChannel.id,
    messageType: type,
  };
}
