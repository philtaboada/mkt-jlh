import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getChannelsByType } from '@/features/chat/api/channels.api';
import { findOrCreateByFacebook, updateLastInteraction } from '@/features/chat/api/contact.api';
import { findOrCreate, updateLastMessage } from '@/features/chat/api/conversation.api';
import { create } from '@/features/chat/api/message.api';
import type { FacebookConfig } from '@/features/chat/types/settings';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const facebookChannels = await getChannelsByType('facebook');
  const activeChannel = facebookChannels.find((ch) => ch.status === 'active');
  const config = activeChannel?.config as FacebookConfig;
  const VERIFY_TOKEN = config?.verify_token;

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge || '', { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    const signature = req.headers.get('x-hub-signature-256');
    if (signature) {
      const isValid = verifySignature(signature, rawBody);
      if (!isValid) {
        return new Response('Invalid signature', { status: 403 });
      }
    }

    const body = JSON.parse(rawBody);

    if (body.object === 'page') {
      for (const entry of body.entry) {
        for (const messaging of entry.messaging || []) {
          const senderId = messaging.sender.id;
          const recipientId = messaging.recipient.id;

          if (messaging.message) {
            const message = messaging.message;
            let text = message.text || null;
            let mediaInfo = null;

            if (message.attachments && message.attachments.length > 0) {
              const attachment = message.attachments[0];
              mediaInfo = {
                url: attachment.payload?.url,
                type: attachment.type,
                mime: attachment.payload?.media?.image_type || null,
              };
            }

            // Create or get contact
            const contact = await findOrCreateByFacebook(senderId);
            const conversation = await findOrCreate(contact.id, 'facebook');

            // Prepare message data
            const messageData = {
              body: text || mediaInfo?.type || 'Media',
              type: mediaInfo ? 'media' : 'text',
              sender_type: 'user' as const,
              sender_id: senderId,
              media_url: mediaInfo?.url || undefined,
              media_mime: mediaInfo?.mime || undefined,
              metadata: {
                ...message,
                fbSenderId: senderId,
                fbRecipientId: recipientId,
              },
            };

            // Save message to database
            await create(conversation.id, messageData);
            await updateLastMessage(conversation.id);
            await updateLastInteraction(contact.id);
          }

          if (messaging.postback) {
            // Handle postbacks if needed
            const contact = await findOrCreateByFacebook(senderId);
            const conversation = await findOrCreate(contact.id, 'facebook');

            const postbackData = {
              body: messaging.postback.title || JSON.stringify(messaging.postback.payload),
              type: 'postback',
              sender_type: 'user' as const,
              sender_id: senderId,
              metadata: {
                payload: messaging.postback.payload,
                title: messaging.postback.title,
              },
            };

            await create(conversation.id, postbackData);
            await updateLastMessage(conversation.id);
            await updateLastInteraction(contact.id);
          }
        }
      }
    }

    return new Response('ok', { status: 200 });
  } catch (error) {
    console.error('Facebook webhook error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

function verifySignature(signature: string, body: string): boolean {
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appSecret) return false;
  const expectedSignature =
    'sha256=' + crypto.createHmac('sha256', appSecret).update(body).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
