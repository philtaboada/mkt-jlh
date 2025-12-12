/**
 * Servicio para enviar mensajes de WhatsApp
 */

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

export interface SendWhatsAppMessageParams {
  to: string;
  message: string;
}

export interface SendWhatsAppMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envía un mensaje de texto por WhatsApp
 */
export async function sendWhatsAppMessage(
  params: SendWhatsAppMessageParams
): Promise<SendWhatsAppMessageResult> {
  const { to, message } = params;

  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error('WhatsApp credentials not configured');
    return { success: false, error: 'WhatsApp not configured' };
  }

  try {
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    };

    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to send message',
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Envía un mensaje de plantilla por WhatsApp
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode: string = 'es',
  components?: Array<{
    type: string;
    parameters: Array<{ type: string; text?: string }>;
  }>
): Promise<SendWhatsAppMessageResult> {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error('WhatsApp credentials not configured');
    return { success: false, error: 'WhatsApp not configured' };
  }

  try {
    const payload: any = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
      },
    };

    if (components) {
      payload.template.components = components;
    }

    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to send template',
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error('Error sending WhatsApp template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
