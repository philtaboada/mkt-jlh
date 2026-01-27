import type { Channel, WhatsAppConfig } from '@/features/chat/types/settings';
import { getChannelsByType } from '../channels.api';
import { sendWhatsAppMessage, sendWhatsAppTemplate } from '@/lib/services';

const MIN_PHONE_LENGTH = 8;
const MAX_PHONE_LENGTH = 15;

/* ───────────────────── Types ───────────────────── */

export interface WhatsAppTemplateComponentParameter {
  type: string;
  text?: string;
}

export interface WhatsAppTemplateComponent {
  type: string;
  parameters: WhatsAppTemplateComponentParameter[];
}

export interface WhatsAppTemplateRequest {
  name: string;
  languageCode?: string;
  components?: WhatsAppTemplateComponent[];
}

export interface WhatsAppSendRequest {
  to: string;
  message?: string;
  type?: 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker';
  mediaUrl?: string;
  caption?: string;
  filename?: string;
  template?: WhatsAppTemplateRequest;
}

/* ───────────────────── Main function ───────────────────── */

export async function sendWhatsApp(req: WhatsAppSendRequest) {
  const { to, message, type = 'text', mediaUrl, caption, filename, template } = req;

  // Validaciones base
  if (!to || (!message && !template && !mediaUrl)) {
    throw new Error('Missing required fields: to and message/template/mediaUrl');
  }

  if (template && !template.name) {
    throw new Error('Template name is required when sending a template message');
  }

  // Normalizar y validar teléfono
  const normalizedTo = normalizePhoneNumber({ raw: to });

  if (!isValidPhoneNumber({ value: normalizedTo })) {
    throw new Error('Invalid phone number format');
  }

  // Obtener canal WhatsApp activo
  const whatsappChannels: Channel[] = await getChannelsByType('whatsapp');
  const activeChannel = whatsappChannels.find((ch) => ch.status === 'active');

  if (!activeChannel) {
    throw new Error('No active WhatsApp channel found');
  }

  const config = activeChannel.config as WhatsAppConfig;
  const accessToken = config.access_token;
  const phoneNumberId = config.phone_number_id;

  if (!accessToken || !phoneNumberId) {
    throw new Error('WhatsApp channel is not properly configured');
  }

  let result;

  /* ───────── Template message ───────── */
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
    /* ───────── Text / Media message ───────── */
    result = await sendWhatsAppMessage({
      to: normalizedTo,
      message,
      type,
      mediaUrl,
      caption: caption?.slice(0, 1024), // WhatsApp caption limit safe
      filename,
      accessToken,
      phoneNumberId,
    });
  }

  if (!result?.success) {
    throw new Error(result?.error || 'Failed to send WhatsApp message');
  }

  return {
    success: true,
    messageId: result.messageId,
    to: normalizedTo,
    channelId: activeChannel.id,
    messageType: template ? 'template' : type,
  };
}

/* ───────────────────── Utils ───────────────────── */

function normalizePhoneNumber({ raw }: { raw: string }): string {
  return raw.replace(/[^\d]/g, '');
}

function isValidPhoneNumber({ value }: { value: string }): boolean {
  return (
    /^\d+$/.test(value) && value.length >= MIN_PHONE_LENGTH && value.length <= MAX_PHONE_LENGTH
  );
}
