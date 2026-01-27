import { NextResponse } from 'next/server';
import crypto from 'crypto';

import { downloadAndUploadMedia } from '@/lib/storage/media';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { findOrCreateByMessenger, updateLastInteraction } from '@/features/chat/api/contact.api';
import { findOrCreate, updateLastMessage } from '@/features/chat/api/conversation.api';
import { create } from '@/features/chat/api/message.api';
import { updateStatusMessageExternal, markMessagesAsReadByWatermark } from '@/features/chat/api/message.api';
import { getChannelsByType } from '@/features/chat/api/channels.api';
import type { MessengerConfig } from '@/features/chat/types/settings';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const messengerChannels = await getChannelsByType('messenger');
  const activeChannel = messengerChannels.find((ch) => ch.status === 'active');
  const config = activeChannel?.config as MessengerConfig;
  const VERIFY_TOKEN = config?.verify_token;

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge || '', { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.clone().text();
    const signature = req.headers.get('x-hub-signature-256');

    if (signature) {
        if (!verifySignature(signature, rawBody)) {
            return new Response('Invalid signature', { status: 403 });
        }
    }

    const body = JSON.parse(rawBody);

    if (body.object !== 'page') {
      return new Response('Not a page event', { status: 404 });
    }

    const messengerChannels = await getChannelsByType('messenger');
    const activeChannel = messengerChannels.find((ch) => ch.status === 'active');

    for (const entry of body.entry || []) {
        const messaging = entry.messaging || [];
        for (const event of messaging) {
            
            // 1. Message Received
            if (event.message) {
                const psid = event.sender.id;
                
                // Ignorar mensajes enviados por la propia página (echo)
                if (event.message.is_echo) continue;

                // Find Contact & Conversation
                const activeConfig = activeChannel?.config as MessengerConfig | undefined;
                const accessToken = activeConfig?.page_access_token;
                
                const contact = await findOrCreateByMessenger(psid, undefined, accessToken);
                const conversation = await findOrCreate(contact.id, 'messenger', activeChannel?.id);
                
                const msg = event.message;
                let text = msg.text;
                let messageType: 'text' | 'image' | 'audio' | 'video' | 'file' = 'text';
                let mediaInfo = null;
                const hasMedia = !!msg.attachments?.length;

                if (hasMedia) {
                    const attachment = msg.attachments[0];
                    const type = attachment.type; // image, video, audio, file
                    const url = attachment.payload.url;
                    
                    if (type === 'image') messageType = 'image';
                    else if (type === 'audio') messageType = 'audio';
                    else if (type === 'video') messageType = 'video';
                    else messageType = 'file';

                    try {
                         mediaInfo = await downloadAndUploadMedia(url, type, 'messenger');
                    } catch (e) {
                         console.error('Error uploading messenger media', e);
                         text = `[Error uploading media] ${url}`;
                    }
                }

                const messageData = {
                  body: text,
                  type: messageType,
                  sender_type: 'user' as const,
                  provider: 'messenger' as const,
                  external_id: msg.mid,
                  sender_id: psid,
                  media_url: mediaInfo?.url ?? undefined,
                  media_mime: mediaInfo?.mime ?? undefined,
                  media_size: mediaInfo?.size ?? undefined,
                  metadata: {
                    ...msg,
                    hasMedia,
                  },
                };

                await create(conversation.id, messageData);
                await updateLastMessage(conversation.id);
                await updateLastInteraction(contact.id);
            } 
            
            // 2. Delivery / Read Receipts
            else if (event.delivery || event.read) {
                if (event.delivery) {
                    for (const mid of event.delivery.mids || []) {
                        await updateStatusMessageExternal({
                            provider: 'messenger',
                            external_id: mid,
                            status: 'delivered',
                        });
                    }
                }
                
                if (event.read) {
                    const watermark = new Date(event.read.watermark);
                    const senderId = event.sender.id;
                    await markMessagesAsReadByWatermark('messenger', senderId, watermark);
                }
            }
        }
    }


    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('[messenger-webhook] ERROR', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}

function verifySignature(signature: string, body: string): boolean {
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appSecret) return true;
  
  const expectedSignature =
    'sha256=' + crypto.createHmac('sha256', appSecret).update(body).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
