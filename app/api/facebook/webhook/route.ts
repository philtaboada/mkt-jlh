import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getChannelsByType } from '@/features/chat/api/channels.api';
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

            // TODO: Guardar mensaje en BD
            // TODO: Procesar IA si es texto sin media
          }

          if (messaging.postback) {
            // TODO: Manejar postbacks
          }
        }
      }
    }

    return new Response('ok', { status: 200 });
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}

function verifySignature(signature: string, body: string): boolean {
  const appSecret = process.env.APP_SECRET;
  if (!appSecret) return false;
  const expectedSignature =
    'sha256=' + crypto.createHmac('sha256', appSecret).update(body).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
