import { NextResponse } from 'next/server';
import { getChannelsByType } from '@/features/chat/api/channels.api';
import { sendWhatsAppMessage } from '@/lib/services/whatsapp';
import type { WhatsAppConfig } from '@/features/chat/types/settings';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing required fields: to, message' }, { status: 400 });
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
    const accessToken = config.access_token;
    const phoneNumberId = config.phone_number_id;

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json({ error: 'WhatsApp configuration not complete' }, { status: 400 });
    }

    console.info('[whatsapp-send] request', {
      channelId: activeChannel.id,
      to,
      messageLength: message.length,
    });
    const result = await sendWhatsAppMessage({
      to,
      message,
      accessToken,
      phoneNumberId,
    });

    if (!result.success) {
      console.error('[whatsapp-send] failed', { error: result.error });
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    console.info('[whatsapp-send] success', { messageId: result.messageId });
    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
