import { NextResponse } from 'next/server';
import { getChannelsByType } from '@/features/chat/api/channels.api';
import { sendWhatsAppMessage, sendWhatsAppTemplate } from '@/lib/services/whatsapp';
import type { Channel, WhatsAppConfig } from '@/features/chat/types/settings';

const MIN_PHONE_LENGTH = 8;
const MAX_PHONE_LENGTH = 15;

interface WhatsAppTemplateComponentParameter {
  type: string;
  text?: string;
}


interface WhatsAppTemplateComponent {
  type: string;
  parameters: WhatsAppTemplateComponentParameter[];
}

interface WhatsAppTemplateRequest {
  name: string;
  languageCode?: string;
  components?: WhatsAppTemplateComponent[];
}

interface WhatsAppSendRequest {
  to: string;
  message?: string;
  template?: WhatsAppTemplateRequest;
}

function normalizePhoneNumber(params: { raw: string }): string {
  return params.raw.replace(/[^\d]/g, '');
}

function isValidPhoneNumber(params: { value: string }): boolean {
  return (
    /^\d+$/.test(params.value) &&
    params.value.length >= MIN_PHONE_LENGTH &&
    params.value.length <= MAX_PHONE_LENGTH
  );
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body: WhatsAppSendRequest = (await req.json()) as WhatsAppSendRequest;
    const { to, message, template } = body;
    if (!to || (!message && !template)) {
      return NextResponse.json({ error: 'Missing required fields: to and message or template' }, { status: 400 });
    }
    if (template && !template.name) {
      return NextResponse.json({ error: 'Missing required fields: template.name' }, { status: 400 });
    }
    const normalizedTo: string = normalizePhoneNumber({ raw: to });
    if (!isValidPhoneNumber({ value: normalizedTo })) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }
    const whatsappChannels: Channel[] = await getChannelsByType('whatsapp');
    const activeChannel: Channel | undefined = whatsappChannels.find((ch) => ch.status === 'active');
    if (!activeChannel) {
      return NextResponse.json(
        { error: 'WhatsApp channel not configured or inactive' },
        { status: 400 }
      );
    }
    const config: WhatsAppConfig = activeChannel.config as WhatsAppConfig;
    const accessToken: string | undefined = config.access_token;
    const phoneNumberId: string = config.phone_number_id;
    const businessAccountId: string = config.business_account_id;
    if (!accessToken || !phoneNumberId || !businessAccountId) {
      return NextResponse.json({ error: 'WhatsApp configuration not complete' }, { status: 400 });
    }
    console.info('[whatsapp-send] request', {
      channelId: activeChannel.id,
      channelStatus: activeChannel.status,
      phoneNumberId,
      businessAccountId,
      to: normalizedTo,
      messageLength: message?.length,
      templateName: template?.name,
    });
    const result = message
      ? await sendWhatsAppMessage({
          to: normalizedTo,
          message,
          accessToken,
          phoneNumberId,
        })
      : await sendWhatsAppTemplate({
          to: normalizedTo,
          templateName: template?.name || '',
          languageCode: template?.languageCode,
          components: template?.components,
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
