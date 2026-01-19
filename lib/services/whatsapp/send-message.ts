/**
 * Servicio para enviar mensajes de WhatsApp
 */

export interface SendWhatsAppMessageParams {
  to: string;
  message: string;
  accessToken: string;
  phoneNumberId: string;
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
  const { to, message, accessToken, phoneNumberId } = params;

  if (!accessToken || !phoneNumberId) {
    console.error('WhatsApp credentials not provided');
    return { success: false, error: 'WhatsApp not configured' };
  }

  const apiUrl = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  try {
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
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

    console.info('WhatsApp API success', {
      to,
      messageId: data.messages?.[0]?.id,
    });
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
export async function sendWhatsAppTemplate(params: {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: Array<{
    type: string;
    parameters: Array<{ type: string; text?: string }>;
  }>;
  accessToken: string;
  phoneNumberId: string;
}): Promise<SendWhatsAppMessageResult> {
  const { to, templateName, languageCode = 'es', components, accessToken, phoneNumberId } = params;

  if (!accessToken || !phoneNumberId) {
    console.error('WhatsApp credentials not configured');
    return { success: false, error: 'WhatsApp not configured' };
  }

  const apiUrl = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

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

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
