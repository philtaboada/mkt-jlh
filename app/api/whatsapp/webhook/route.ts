import { NextResponse } from 'next/server';
import crypto from 'crypto';

import { downloadAndUploadMedia } from '@/lib/storage/media';
import { findOrCreateByWhatsApp, updateLastInteraction } from '@/features/chat/api/contact.api';
import { findOrCreate, updateLastMessage } from '@/features/chat/api/conversation.api';
import { create } from '@/features/chat/api/message.api';
import { getChannelsByType } from '@/features/chat/api/channels.api';
import { processIncomingMessage, isAIEnabledForChannel } from '@/lib/services/ai';
import { sendWhatsAppMessage } from '@/lib/services/whatsapp';
import type { WebsiteWidgetConfig, WhatsAppConfig } from '@/features/chat/types/settings';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const whatsappChannels = await getChannelsByType('whatsapp');
  const activeChannel = whatsappChannels.find((ch) => ch.status === 'active');
  const config = activeChannel?.config as WhatsAppConfig;
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
    const value = body.entry?.[0]?.changes?.[0]?.value;

    if (value?.messages?.length > 0) {
      for (const msg of value.messages) {
        const waId = msg.from;
        const name = value.contacts?.[0]?.profile?.name || null;

        const contact = await findOrCreateByWhatsApp(waId, name);
        const conversation = await findOrCreate(contact.id, 'whatsapp');

        let text = msg.text?.body ?? msg[msg.type]?.caption ?? null;
        let mediaInfo = null;

        const mediaTypes = ['image', 'audio', 'video', 'document', 'sticker'];
        const hasMedia = mediaTypes.includes(msg.type);

        if (hasMedia) {
          const mediaId = msg[msg.type]?.id;
          const caption = msg[msg.type]?.caption;

          if (caption) text = caption;

          if (mediaId) {
            mediaInfo = await downloadAndUploadMedia(mediaId, msg.type);
          }
        }

        const messageData = {
          body: text,
          type: hasMedia ? msg.type : 'text',
          sender_type: 'user' as const,
          sender_id: waId,
          media_url: mediaInfo?.url ?? undefined,
          media_mime: mediaInfo?.mime ?? undefined,
          media_size: mediaInfo?.size ?? undefined,
          media_name: msg[msg.type]?.filename ?? mediaInfo?.name ?? undefined,
          metadata: {
            ...msg,
            hasMedia,
            mediaType: hasMedia ? msg.type : null,
          },
        };

        await create(conversation.id, messageData);
        await updateLastMessage(conversation.id);
        await updateLastInteraction(contact.id);

        if (msg.type === 'text' && text && !hasMedia) {
          try {
            const whatsappChannels = await getChannelsByType('whatsapp');
            const activeChannel = whatsappChannels.find((ch) => ch.status === 'active');

            if (activeChannel) {
              const channelConfig = activeChannel.config as WebsiteWidgetConfig;

              if (isAIEnabledForChannel(channelConfig)) {
                const result = await processIncomingMessage({
                  conversationId: conversation.id,
                  userMessage: text,
                  channelConfig,
                  contactName: name || undefined,
                  channel: 'whatsapp',
                  autoSaveReply: true,
                });

                if (result.shouldReply && result.reply) {
                  const config = channelConfig as WhatsAppConfig;
                  await sendWhatsAppMessage({
                    to: waId,
                    message: result.reply,
                    accessToken: config.access_token || '',
                    phoneNumberId: config.phone_number_id,
                  });
                }
              }
            }
          } catch (aiError) {
            // Silent fail for AI processing
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    return new Response('Internal Server Error', { status: 500 });
  }
}

function verifySignature(signature: string, body: string): boolean {
  try {
    const appSecret = process.env.APP_SECRET;
    if (!appSecret) return false;
    const expected = signature.split('=')[1];
    const calc = crypto.createHmac('sha256', appSecret).update(body).digest('hex');
    return expected === calc;
  } catch {
    return false;
  }
}
