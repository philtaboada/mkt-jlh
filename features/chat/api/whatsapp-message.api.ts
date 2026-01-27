'use server';

import { getChannelsByType } from './channels.api';
import { sendWhatsAppTemplate } from '@/lib/services/whatsapp';
import { getTemplateByName } from './template.api';
import { findOrCreate } from './conversation.api';
import { create } from './message.api';
import { findOrCreateByWhatsApp } from './contact.api';
import type { Channel, WhatsAppConfig } from '../types/settings';
import type { MessageTemplate } from '../types/template';

const MIN_PHONE_LENGTH = 8;
const MAX_PHONE_LENGTH = 15;

function normalizePhoneNumber(raw: string): string {
  return raw.replace(/[^\d]/g, '');
}

function isValidPhoneNumber(value: string): boolean {
  return (
    /^\d+$/.test(value) && value.length >= MIN_PHONE_LENGTH && value.length <= MAX_PHONE_LENGTH
  );
}

function buildTemplateComponents(
  templateComponents: MessageTemplate['components'],
  params: Record<string, string>
): Array<{
  type: string;
  parameters: Array<{ type: string; text: string }>;
}> {
  const components: Array<{
    type: string;
    parameters: Array<{ type: string; text: string }>;
  }> = [];

  for (const comp of templateComponents) {
    if (comp.type === 'BODY' && comp.text) {
      const placeholders = comp.text.match(/\{\{(\d+)\}\}/g) || [];
      const parameters = placeholders.map((placeholder) => {
        const index = parseInt(placeholder.replace(/\{\{|\}\}/g, ''), 10);
        const paramKey = `param_${index}`;
        return {
          type: 'text',
          text: params[paramKey] || params[index.toString()] || '',
        };
      });

      if (parameters.length > 0) {
        components.push({
          type: 'body',
          parameters,
        });
      }
    }

    if (comp.type === 'HEADER' && comp.text) {
      const placeholders = comp.text.match(/\{\{(\d+)\}\}/g) || [];
      const parameters = placeholders.map((placeholder) => {
        const index = parseInt(placeholder.replace(/\{\{|\}\}/g, ''), 10);
        const paramKey = `header_param_${index}`;
        return {
          type: 'text',
          text: params[paramKey] || params[`header_${index}`] || '',
        };
      });

      if (parameters.length > 0) {
        components.push({
          type: 'header',
          parameters,
        });
      }
    }
  }

  return components;
}

/**
 * Envía un mensaje usando un template de WhatsApp
 */
export async function sendMessageWithTemplate(params: {
  to: string;
  templateName: string;
  channelId?: string;
  templateParams?: Record<string, string>;
}): Promise<{ success: boolean; messageId?: string; conversationId?: string; error?: string }> {
  try {
    const { to, template_name, template_params, channel_id } = {
      to: params.to,
      template_name: params.templateName,
      template_params: params.templateParams || {},
      channel_id: params.channelId,
    };

    if (!to || !template_name) {
      return {
        success: false,
        error: 'Missing required fields: to and template_name',
      };
    }

    const normalizedTo = normalizePhoneNumber(to);
    if (!isValidPhoneNumber(normalizedTo)) {
      return {
        success: false,
        error: 'Invalid phone number format',
      };
    }

    let channels: Channel[];
    if (channel_id) {
      const allChannels = await getChannelsByType('whatsapp');
      channels = allChannels.filter((ch) => ch.id === channel_id);
    } else {
      channels = await getChannelsByType('whatsapp');
    }

    const activeChannel = channels.find((ch) => ch.status === 'active');

    if (!activeChannel) {
      return {
        success: false,
        error: 'WhatsApp channel not configured or inactive',
      };
    }

    const config: WhatsAppConfig = activeChannel.config as WhatsAppConfig;
    const { access_token, phone_number_id } = config;

    if (!access_token || !phone_number_id) {
      return {
        success: false,
        error: 'WhatsApp configuration not complete',
      };
    }

    const template = await getTemplateByName(activeChannel.id, template_name, 'whatsapp');

    if (!template) {
      return {
        success: false,
        error: `Template "${template_name}" not found. Please sync templates first.`,
      };
    }

    if (template.status !== 'APPROVED') {
      return {
        success: false,
        error: `Template "${template_name}" is not approved (status: ${template.status})`,
      };
    }

    const contact = await findOrCreateByWhatsApp(normalizedTo, `Contacto ${normalizedTo}`);
    const conversation = await findOrCreate(contact.id, 'whatsapp', activeChannel.id);

    const components = template_params
      ? buildTemplateComponents(template.components, template_params)
      : undefined;

    const result = await sendWhatsAppTemplate({
      to: normalizedTo,
      templateName: template_name,
      languageCode: template.language,
      components,
      accessToken: access_token,
      phoneNumberId: phone_number_id,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    await create(conversation.id, {
      sender_type: 'bot',
      sender_id: 'whatsapp-bot',
      type: 'text',
      body: `Template: ${template_name}`,
      metadata: {
        template_id: template.id,
        template_name: template_name,
        message_id: result.messageId,
        is_first_message: true,
      },
    });

    return {
      success: true,
      messageId: result.messageId,
      conversationId: conversation.id,
    };
  } catch (error) {
    console.error('Error sending first message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    };
  }
}
