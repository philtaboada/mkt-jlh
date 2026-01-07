import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getChannelsByType } from '@/features/chat/api/channels.api';
import { findOrCreateByInstagram, updateLastInteraction } from '@/features/chat/api/contact.api';
import { findOrCreate, updateLastMessage } from '@/features/chat/api/conversation.api';
import { create } from '@/features/chat/api/message.api';
import type { InstagramConfig } from '@/features/chat/types/settings';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const instagramChannels = await getChannelsByType('instagram');
  const activeChannel = instagramChannels.find((ch) => ch.status === 'active');
  const config = activeChannel?.config as InstagramConfig;
  const VERIFY_TOKEN = config?.verify_token;

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge || '', { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.clone().text();
    const signature = req.headers.get('X-Hub-Signature-256');

    if (signature && !verifySignature(signature, rawBody)) {
      return new Response('Invalid signature', { status: 403 });
    }

    const body = JSON.parse(rawBody);

    if (body.object === 'instagram') {
      const entry = body.entry?.[0];
      const messaging = entry?.messaging?.[0];

      if (messaging) {
        const senderId = messaging.sender.id;
        let text = null;
        let mediaInfo = null;
        let messageType: 'text' | 'image' | 'audio' | 'video' | 'file' = 'text';

        if (messaging.message?.text) {
          text = messaging.message.text;
        }

        if (messaging.message?.attachments) {
          const attachment = messaging.message.attachments[0];
          mediaInfo = {
            url: attachment.payload?.url,
            type: attachment.type,
            mime: attachment.payload?.media?.image_type || null,
          };
          // Map Instagram attachment types to MessageType
          if (attachment.type === 'image') messageType = 'image';
          else if (attachment.type === 'audio') messageType = 'audio';
          else if (attachment.type === 'video') messageType = 'video';
          else if (attachment.type === 'file') messageType = 'file';
        }

        if (messaging.message?.image) {
          mediaInfo = {
            url: messaging.message.image.url,
            type: 'image',
            mime: 'image/jpeg',
          };
          messageType = 'image';
        }

        if (messaging.message?.video) {
          mediaInfo = {
            url: messaging.message.video.url,
            type: 'video',
            mime: 'video/mp4',
          };
          messageType = 'video';
        }

        // Create or get contact
        const contact = await findOrCreateByInstagram(senderId);
        const conversation = await findOrCreate(contact.id, 'instagram');

        // Prepare message data
        const messageData = {
          body: text || 'Media',
          type: messageType,
          sender_type: 'user' as const,
          sender_id: senderId,
          media_url: mediaInfo?.url || undefined,
          media_mime: mediaInfo?.mime || undefined,
          metadata: {
            ...messaging.message,
            igSenderId: senderId,
          },
        };

        // Save message to database
        await create(conversation.id, messageData);
        await updateLastMessage(conversation.id);
        await updateLastInteraction(contact.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Instagram webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function verifySignature(signature: string, rawBody: string): boolean {
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!appSecret) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
  return signature === expected;
}
