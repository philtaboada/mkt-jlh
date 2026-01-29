import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { getChannelsByType } from '@/features/chat/api/channels.api';
import { TikTokConfig } from '@/features/chat/types/settings';
import { downloadAndUploadMedia } from '@/lib/storage/media';
import { findOrCreateByTikTok, updateLastInteraction } from '@/features/chat/api/contact.api';
import {
  findOrCreate as findOrCreateConversation,
  updateLastMessage,
} from '@/features/chat/api/conversation.api';
import {
  create as createMessage,
  updateStatusMessageExternal,
} from '@/features/chat/api/message.api';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode !== 'subscribe' || !token) {
      return new Response('Forbidden', { status: 403 });
    }

    const channels = await getChannelsByType('tiktok');
    const activeChannel = channels.find((c) => c.status === 'active');
    const config = activeChannel?.config as TikTokConfig | undefined;

    if (!activeChannel || !config?.verify_token) {
      console.warn('[tiktok-webhook] channel not configured');
      return new Response('Forbidden', { status: 403 });
    }

    if (token !== config.verify_token) {
      return new Response('Forbidden', { status: 403 });
    }

    return new Response(challenge ?? '', { status: 200 });
  } catch (err) {
    console.error('[tiktok-webhook][GET]', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.clone().text();

    const signatureHeader =
      req.headers.get('tiktok-signature') ||
      req.headers.get('x-tiktok-signature-256') ||
      req.headers.get('x-tt-signature') ||
      req.headers.get('x-hub-signature-256');

    if (signatureHeader && process.env.TIKTOK_APP_SECRET) {
      try {
        const secret = process.env.TIKTOK_APP_SECRET;
        let valid = false;

        // New TikTok format: "t=<timestamp>,s=<signature>"
        if (/\bt=/i.test(signatureHeader) && /\bs=/i.test(signatureHeader)) {
          const parts = signatureHeader.split(',').map((p) => p.trim());
          let t: string | undefined;
          let s: string | undefined;
          for (const p of parts) {
            const [k, ...rest] = p.split('=');
            const v = rest.join('=');
            if (!k || v === undefined) continue;
            const key = k.trim();
            if (key === 't') t = v.trim();
            if (key === 's') s = v.trim();
          }

          if (!t || !s) {
            console.warn('[tiktok-webhook] invalid signature header format');
            return new Response('Invalid signature', { status: 403 });
          }

          const signedPayload = `${t}.${rawBody}`;
          const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

          const expectedBuf = Buffer.from(expected, 'hex');
          const receivedHex = s.replace(/^sha256=/i, '').trim();
          const receivedBuf = Buffer.from(receivedHex, 'hex');

          if (
            expectedBuf.length === receivedBuf.length &&
            crypto.timingSafeEqual(expectedBuf, receivedBuf)
          ) {
            const ts = parseInt(t, 10);
            const now = Math.floor(Date.now() / 1000);
            const tolerance = 5 * 60; // 5 minutes
            if (Number.isFinite(ts) && Math.abs(now - ts) <= tolerance) {
              valid = true;
            } else {
              console.warn('[tiktok-webhook] signature timestamp outside tolerance');
              return new Response('Invalid signature timestamp', { status: 403 });
            }
          }
        } else {
          // Fallback: header contains raw sha256 or "sha256=<hex>"
          const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
          const received = signatureHeader.replace(/^sha256=/i, '').trim();
          const expectedBuf = Buffer.from(expected, 'hex');
          const receivedBuf = Buffer.from(received, 'hex');
          if (
            expectedBuf.length === receivedBuf.length &&
            crypto.timingSafeEqual(expectedBuf, receivedBuf)
          ) {
            valid = true;
          }
        }

        if (!valid) {
          console.warn('[tiktok-webhook] invalid signature');
          return new Response('Invalid signature', { status: 403 });
        }
      } catch (err) {
        console.error('[tiktok-webhook] signature verification error', err);
        return new Response('Invalid signature', { status: 403 });
      }
    }

    const payload = rawBody ? JSON.parse(rawBody) : {};

    const events: any[] =
      payload?.events ||
      payload?.data ||
      payload?.entry?.flatMap((e: any) => e.messaging || e.events || []) ||
      (payload ? [payload] : []);

    if (!events.length) {
      return NextResponse.json({ status: 'ignored' });
    }

    const channels = await getChannelsByType('tiktok');
    const activeChannel = channels.find((c) => c.status === 'active');

    if (!activeChannel) {
      console.warn('[tiktok-webhook] no active channel');
      return NextResponse.json({ status: 'ignored' });
    }

    for (const ev of events) {
      try {
        if (ev.status || ev.statuses) {
          const statuses = ev.statuses ?? [ev.status];

          for (const s of statuses) {
            if (s?.id && s?.status) {
              await updateStatusMessageExternal({
                provider: 'tiktok',
                external_id: s.id,
                status: s.status,
              });
            }
          }
          continue;
        }

        const senderId = ev.sender?.id || ev.from?.id || ev.user?.id || ev.user_id;

        if (!senderId) continue;

        const externalId = ev.message?.id || ev.message_id || ev.event_id || ev.id;

        const senderName =
          ev.sender?.name || ev.user?.name || ev.profile?.display_name || undefined;

        const contact = await findOrCreateByTikTok(String(senderId), senderName);

        const conversation = await findOrCreateConversation(contact.id, 'tiktok', activeChannel.id);

        let text: string | null = null;
        let messageType: 'text' | 'image' | 'audio' | 'video' | 'file' = 'text';
        let mediaInfo: any = null;

        // Text
        if (ev.message?.text) text = ev.message.text;
        if (ev.text?.content) text = ev.text.content;

        // Media
        const media = ev.message?.media || ev.media || null;

        if (media?.url) {
          try {
            mediaInfo = await downloadAndUploadMedia(media.url, media.type, 'tiktok');
          } catch (err) {
            console.error('[tiktok-webhook] media upload failed', err);
            text = text ?? '[Error uploading media]';
          }

          if (/image/.test(media.type)) messageType = 'image';
          else if (/video/.test(media.type)) messageType = 'video';
          else if (/audio|voice/.test(media.type)) messageType = 'audio';
          else messageType = 'file';
        }

        await createMessage(conversation.id, {
          body: text ?? undefined,
          type: messageType,
          sender_type: 'user',
          provider: 'tiktok',
          external_id: externalId ?? null,
          sender_id: String(senderId),
          media_url: mediaInfo?.url,
          media_mime: mediaInfo?.mime,
          media_size: mediaInfo?.size,
          metadata: {
            raw: ev,
            tiktok_event_type: ev.event_type,
            tiktok_timestamp: ev.timestamp,
          },
        });

        await updateLastMessage(conversation.id);
        await updateLastInteraction(contact.id);
      } catch (err) {
        console.error('[tiktok-webhook] event error', err, ev);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('[tiktok-webhook][POST]', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
