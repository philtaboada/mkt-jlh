import { NextResponse } from 'next/server';
import { getChannelsByType } from '@/features/chat/api/channels.api';
import type { WhatsAppConfig } from '@/features/chat/types/settings';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, type, text } = body;

    if (!to) {
      return NextResponse.json({ error: "Missing 'to'" }, { status: 400 });
    }

    if (type === 'text' && (!text || !text.body)) {
      return NextResponse.json({ error: 'Missing text.body' }, { status: 400 });
    }

    const whatsappChannels = await getChannelsByType('whatsapp');
    const activeChannel = whatsappChannels.find((ch) => ch.status === 'active');

    if (!activeChannel) {
      return NextResponse.json(
        { error: 'WhatsApp channel not configured or inactive' },
        { status: 400 }
      );
    }

    const config = activeChannel.config as WhatsAppConfig;
    const TOKEN = config.access_token;
    const PHONE_NUMBER_ID = config.phone_number_id;

    if (!TOKEN || !PHONE_NUMBER_ID) {
      return NextResponse.json({ error: 'WhatsApp configuration not complete' }, { status: 400 });
    }

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type,
      text,
    };

    const response = await fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
