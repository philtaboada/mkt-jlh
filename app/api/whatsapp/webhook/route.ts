import { NextResponse } from 'next/server';
import crypto from 'crypto';

import { downloadAndUploadMedia } from '@/lib/storage/media';
import { findOrCreateByWhatsApp, updateLastInteraction } from '@/features/chat/api/contact.api';
import { findOrCreate, updateLastMessage } from '@/features/chat/api/conversation.api';
import { create } from '@/features/chat/api/message.api';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

/**
 * ===========================
 * VALIDACIÓN DEL WEBHOOK (GET)
 * ===========================
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge || '', { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

/**
 * ===========================
 * MANEJO DEL WEBHOOK (POST)
 * ===========================
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.clone().text();
    const signature = req.headers.get('X-Hub-Signature-256');

    if (signature && !verifySignature(signature, rawBody)) {
      console.warn('❌ Firma inválida, pero aceptando (modo DEV)');
    }

    const body = JSON.parse(rawBody);
    const value = body.entry?.[0]?.changes?.[0]?.value;

    console.log('🔔 Webhook recibido:', JSON.stringify(value));
    /** ===========================
     *   🔵 MENSAJE ENTRANTE
     * =========================== */
    if (value?.messages?.length > 0) {
      for (const msg of value.messages) {
        const waId = msg.from;
        const name = value.contacts?.[0]?.profile?.name || null;

        console.log('📩 Mensaje:', msg);

        // Crear contacto/conversación
        const contact = await findOrCreateByWhatsApp(waId, name);
        const conversation = await findOrCreate(contact.id, 'whatsapp');

        let text = msg.text?.body ?? msg[msg.type]?.caption ?? null;
        let mediaInfo = null;

        /** ===========================
         *   🔵 SI ES MEDIA → DOWNLOAD + GCP
         * =========================== */
        if (msg.type !== 'text') {
          const mediaId = msg[msg.type]?.id;

          if (mediaId) {
            console.log('🟣 Descargando media:', mediaId);

            mediaInfo = await downloadAndUploadMedia(mediaId, msg.type);
          }
        }

        /** ===========================
         *   🔵 GUARDAR EN CRM
         * =========================== */
        await create(conversation.id, {
          body: text,
          type: msg.type,
          sender_id: waId,
          media_url: mediaInfo?.url ?? undefined,
          media_mime: mediaInfo?.mime ?? undefined,
          media_size: mediaInfo?.size ?? undefined,
          media_name: msg[msg.type]?.filename ?? undefined,
          metadata: msg,
        });

        await updateLastMessage(conversation.id);
        await updateLastInteraction(contact.id);

        console.log('💾 Mensaje guardado en CRM');
      }
    }

    /** ===========================
     *   🟠 ESTADOS (delivered, read...)
     * =========================== */
    if (value?.statuses?.length > 0) {
      console.log('📦 STATUS:', value.statuses[0]);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('❌ Error en webhook:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}

/**
 * ===========================
 * VALIDACIÓN DE FIRMA
 * ===========================
 */
function verifySignature(signature: string, body: string): boolean {
  try {
    const expected = signature.split('=')[1];
    const calc = crypto
      .createHmac('sha256', process.env.WHATSAPP_APP_SECRET || '')
      .update(body)
      .digest('hex');

    return expected === calc;
  } catch {
    return false;
  }
}
