import { NextResponse } from 'next/server';
import crypto from 'crypto';

import { downloadAndUploadMedia } from '@/lib/storage/media';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { findOrCreateByWhatsApp, updateLastInteraction } from '@/features/chat/api/contact.api';
import { findOrCreate, updateLastMessage } from '@/features/chat/api/conversation.api';
import { create } from '@/features/chat/api/message.api';
import { getChannelsByType } from '@/features/chat/api/channels.api';
import type { WhatsAppConfig } from '@/features/chat/types/settings';

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

    console.info('[whatsapp-webhook] incoming request', {
      hasSignature: Boolean(signature),
      bodyLength: rawBody.length,
    });

    if (signature && !verifySignature(signature, rawBody)) {
      console.warn('[whatsapp-webhook] invalid signature');
      return new Response('Invalid signature', { status: 403 });
    }

    const body = JSON.parse(rawBody);
    const value = body.entry?.[0]?.changes?.[0]?.value;

    // Log detallado del mensaje para debugging
    if (value?.messages?.length > 0) {
      const firstMsg = value.messages[0];
      console.info('[whatsapp-webhook] message received', {
        type: firstMsg.type,
        from: firstMsg.from,
        hasText: Boolean(firstMsg.text),
        hasImage: Boolean(firstMsg.image),
        hasAudio: Boolean(firstMsg.audio),
        hasVideo: Boolean(firstMsg.video),
        hasDocument: Boolean(firstMsg.document),
        hasSticker: Boolean(firstMsg.sticker),
        imageId: firstMsg.image?.id,
        audioId: firstMsg.audio?.id,
        rawMessage: JSON.stringify(firstMsg).substring(0, 500),
      });
    }

    const statuses = value?.statuses as
      | Array<{
          id?: string;
          status?: string;
          recipient_id?: string;
          timestamp?: string;
          errors?: Array<{
            code?: number;
            title?: string;
            message?: string;
            error_data?: { details?: string };
          }>;
        }>
      | undefined;

    if (statuses && statuses.length > 0) {
      for (const status of statuses) {
        console.info('[whatsapp-webhook] status update', {
          id: status.id,
          status: status.status,
          recipientId: status.recipient_id,
          timestamp: status.timestamp,
          errors: status.errors,
        });
      }
    }

    if (value?.messages?.length > 0) {
      const whatsappChannels = await getChannelsByType('whatsapp');
      const activeChannel = whatsappChannels.find((ch) => ch.status === 'active');
      
      for (const msg of value.messages) {
        const waId = msg.from;
        const name = value.contacts?.[0]?.profile?.name || null;

        const contact = await findOrCreateByWhatsApp(waId, name);
        const conversation = await findOrCreate(
          contact.id,
          'whatsapp',
          activeChannel?.id
        );

        let text = msg.text?.body ?? msg[msg.type]?.caption ?? null;
        let mediaInfo = null;

        const mediaTypes = ['image', 'audio', 'video', 'document', 'sticker'];
        const hasMedia = mediaTypes.includes(msg.type);
        let messageType: 'text' | 'image' | 'audio' | 'video' | 'file' = 'text';

        if (hasMedia) {
          const mediaId = msg[msg.type]?.id;
          const caption = msg[msg.type]?.caption;

          console.info('[whatsapp-webhook] incoming media', {
            waId,
            messageType: msg.type,
            mediaId,
            hasCaption: Boolean(caption),
            caption: caption?.substring(0, 100),
            rawImage: JSON.stringify(msg[msg.type] || {}).substring(0, 200),
          });

          if (caption) {
            text = caption;
          }

          if (mediaId) {
            try {
              mediaInfo = await downloadAndUploadMedia(mediaId, msg.type, 'whatsapp');
              console.info('[whatsapp-webhook] media upload success', {
                waId,
                mediaId,
                mediaType: msg.type,
                url: mediaInfo?.url,
                hasCaption: Boolean(caption),
              });
              
              // Solo establecer messageType como media si la descarga fue exitosa
              if (msg.type === 'image') messageType = 'image';
              else if (msg.type === 'audio') messageType = 'audio';
              else if (msg.type === 'video') messageType = 'video';
              else if (msg.type === 'document') messageType = 'file';
              else if (msg.type === 'sticker') messageType = 'image';
            } catch (mediaError) {
              const errorMessage = mediaError instanceof Error ? mediaError.message : String(mediaError);
              console.error('[whatsapp-webhook] media download/upload error', {
                waId,
                mediaId,
                mediaType: msg.type,
                error: errorMessage,
                hasCaption: Boolean(caption),
                stack: mediaError instanceof Error ? mediaError.stack : undefined,
              });
              const errorText = `[Error al procesar ${msg.type}: ${errorMessage}]`;
              text = caption ? `${errorText}\n\n${caption}` : errorText;
              messageType = 'text';
            }
          } else {
            console.warn('[whatsapp-webhook] media detected but no mediaId', {
              waId,
              messageType: msg.type,
              msgKeys: Object.keys(msg),
              imageObject: msg.image,
              hasCaption: Boolean(caption),
            });
            const errorText = `[${msg.type} sin ID de media]`;
            text = caption ? `${errorText}\n\n${caption}` : errorText;
            messageType = 'text';
          }
        }

        const messageData = {
          body: text,
          type: messageType,
          sender_type: 'user' as const,
          sender_id: waId,
          media_url: mediaInfo?.url ?? undefined,
          media_mime: mediaInfo?.mime ?? undefined,
          media_size: mediaInfo?.size ?? undefined,
          media_name: msg[msg.type]?.filename ?? undefined,
          metadata: {
            ...msg,
            hasMedia,
            mediaType: hasMedia ? msg.type : null,
          },
        };

        await create(conversation.id, messageData);
        await updateLastMessage(conversation.id);
        await updateLastInteraction(contact.id);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('[whatsapp-webhook] CRITICAL ERROR', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return new Response('Internal Server Error', { status: 500 });
  }
}

function verifySignature(signature: string, body: string): boolean {
  try {
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (!appSecret) return false;
    const expected = signature.split('=')[1];
    const calc = crypto.createHmac('sha256', appSecret).update(body).digest('hex');
    return expected === calc;
  } catch {
    return false;
  }
}
