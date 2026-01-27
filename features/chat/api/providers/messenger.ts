import type { Channel, FacebookConfig } from '@/features/chat/types/settings';
import { getChannelsByType } from '../channels.api';
import { sendFacebookMessage } from '@/lib/services/facebook';

/* ───────────────────── Types ───────────────────── */

export type MessengerMessageType = 'text' | 'image' | 'audio' | 'video' | 'file';

export type MessengerTag = 'HUMAN_AGENT' | 'POST_PURCHASE_UPDATE' | 'CONFIRMED_EVENT_UPDATE';

export interface MessengerSendRequest {
  to: string; // PSID
  type?: MessengerMessageType;
  message?: string;
  mediaUrl?: string;
  tag?: MessengerTag;
}

/* ───────────────────── Main function ───────────────────── */

export async function sendMessenger(req: MessengerSendRequest) {
  const { to, type = 'text', message, mediaUrl, tag } = req;

  /* ───────── Validaciones base ───────── */

  if (!to) {
    throw new Error('Missing required field: to (PSID)');
  }

  if (type === 'text' && !message) {
    throw new Error('Message text is required for text messages');
  }

  if (type !== 'text' && !mediaUrl) {
    throw new Error(`mediaUrl is required for ${type} messages`);
  }

  /* ───────── Obtener canal Messenger activo ───────── */

  const messengerChannels: Channel[] = await getChannelsByType('messenger');
  const activeChannel = messengerChannels.find((ch) => ch.status === 'active');

  if (!activeChannel) {
    throw new Error('No active Messenger channel found');
  }

  const config = activeChannel.config as FacebookConfig;
  const accessToken = config.page_access_token;
  const pageId = config.page_id;

  if (!accessToken || !pageId) {
    throw new Error('Messenger channel is not properly configured');
  }

  /* ───────── Envío ───────── */

  const result = await sendFacebookMessage({
    to,
    type,
    message,
    mediaUrl,
    tag,
    accessToken,
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to send Messenger message');
  }

  return {
    success: true,
    messageId: result.messageId,
    to,
    channelId: activeChannel.id,
    messageType: type,
  };
}
