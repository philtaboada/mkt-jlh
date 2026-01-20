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
  type?: 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker';
  mediaUrl?: string;
  caption?: string;
  template?: WhatsAppTemplateRequest;
}

interface WhatsAppEnvLog {
  channelId: string;
  channelStatus: string;
  phoneNumberId: string;
  businessAccountId: string;
  hasAccessToken: boolean;
  accessTokenLength: number;
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

function logWhatsAppEnv(params: { config: WhatsAppConfig; channel: Channel }): void {
  const accessToken: string | undefined = params.config.access_token;
  const envLog: WhatsAppEnvLog = {
    channelId: params.channel.id,
    channelStatus: params.channel.status,
    phoneNumberId: params.config.phone_number_id,
    businessAccountId: params.config.business_account_id,
    hasAccessToken: Boolean(accessToken),
    accessTokenLength: accessToken ? accessToken.length : 0,
  };
  console.info('[whatsapp-send] env', envLog);
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body: WhatsAppSendRequest = (await req.json()) as WhatsAppSendRequest;
    const { to, message, type = 'text', mediaUrl, caption, template } = body;
    
    // Validación básica: se requiere 'to' y alguno de los contenidos (message, template, o mediaUrl)
    if (!to || (!message && !template && !mediaUrl)) {
      return NextResponse.json({ error: 'Missing required fields: to and message, template, or mediaUrl' }, { status: 400 });
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
    
    logWhatsAppEnv({ config, channel: activeChannel });
    
    if (!accessToken || !phoneNumberId || !businessAccountId) {
      return NextResponse.json({ error: 'WhatsApp configuration not complete' }, { status: 400 });
    }
    
    console.info('[whatsapp-send] request', {
      channelId: activeChannel.id,
      channelStatus: activeChannel.status,
      phoneNumberId,
      businessAccountId,
      to: normalizedTo,
      type,
      messageLength: message?.length,
      mediaUrl: mediaUrl ? 'present' : 'absent',
      templateName: template?.name,
    });
    
    let result;
    
    if (template) {
      result = await sendWhatsAppTemplate({
        to: normalizedTo,
        templateName: template.name,
        languageCode: template.languageCode,
        components: template.components,
        accessToken,
        phoneNumberId,
      });
    } else {
      // Envío de mensaje normal (texto o media)
      result = await sendWhatsAppMessage({
        to: normalizedTo,
        message, // Puede ser undefined si es solo media
        type,
        mediaUrl,
        caption: caption || message, // Usar message como caption si caption no está explícito
        accessToken,
        phoneNumberId,
      });
    }
    
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
