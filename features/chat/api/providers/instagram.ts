import type { Channel, InstagramConfig } from '@/features/chat/types/settings';
import { getChannelsByType } from '../channels.api';
import { sendInstagramMessage } from '@/lib/services/instagram';

/* ───────────────────── Types ───────────────────── */

export type InstagramMessageType = 'text' | 'image' | 'video' | 'audio' | 'file';

export interface InstagramSendRequest {
  to: string; // Instagram Scoped User ID
  type?: InstagramMessageType;
  message?: string;
  mediaUrl?: string;
}

export async function sendInstagram(req: InstagramSendRequest) {
  const { to, type = 'text', message, mediaUrl } = req;

  /* ───────── Validaciones base ───────── */

  if (!to) {
    throw new Error('Missing required field: to (Instagram user id)');
  }

  if (type === 'text' && !message) {
    throw new Error('Message text is required for text messages');
  }

  if (type !== 'text' && !mediaUrl) {
    throw new Error(`mediaUrl is required for ${type} messages`);
  }

  const instagramChannels: Channel[] = await getChannelsByType('instagram');
  const activeChannel = instagramChannels.find((ch) => ch.status === 'active');

  if (!activeChannel) {
    throw new Error('No active Instagram channel found');
  }

  const config = activeChannel.config as InstagramConfig;
  const accessToken = config.access_token;
  const instagramBusinessId = config.account_id;

  if (!accessToken || !instagramBusinessId) {
    throw new Error('Instagram channel is not properly configured');
  }

  /* ───────── Envío ───────── */

  const result = await sendInstagramMessage({
    to,
    type,
    message,
    mediaUrl,
    accessToken,
    instagramBusinessId,
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to send Instagram message');
  }

  return {
    success: true,
    messageId: result.messageId,
    to,
    channelId: activeChannel.id,
    messageType: type,
  };
}
