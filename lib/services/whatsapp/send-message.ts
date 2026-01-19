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

interface WhatsAppApiError {
  message?: string;
  type?: string;
  code?: number;
  error_subcode?: number;
  fbtrace_id?: string;
}

interface WhatsAppApiResponse {
  messages?: Array<{ id?: string }>;
  error?: WhatsAppApiError;
}

interface WhatsAppTemplateComponentParameter {
  type: string;
  text?: string;
}

interface WhatsAppTemplateComponent {
  type: string;
  parameters: WhatsAppTemplateComponentParameter[];
}

interface WhatsAppTemplatePayload {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: { code: string };
    components?: WhatsAppTemplateComponent[];
  };
}

function buildWhatsAppErrorMessage(params: { status: number; error?: WhatsAppApiError }): string {
  const { status, error } = params;
  if (!error?.message) {
    return `Failed to send message (status ${status})`;
  }
  if (!error.code) {
    return error.message;
  }
  return `(#${error.code}) ${error.message}`;
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
    const response: Response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data: WhatsAppApiResponse = await response.json();
    if (!response.ok) {
      console.error('WhatsApp API error:', {
        status: response.status,
        error: data.error,
        to,
        phoneNumberId,
      });
      return {
        success: false,
        error: buildWhatsAppErrorMessage({ status: response.status, error: data.error }),
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
    const payload: WhatsAppTemplatePayload = {
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
    const response: Response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data: WhatsAppApiResponse = await response.json();
    if (!response.ok) {
      console.error('WhatsApp API error:', {
        status: response.status,
        error: data.error,
        to,
        phoneNumberId,
        templateName,
      });
      return {
        success: false,
        error: buildWhatsAppErrorMessage({ status: response.status, error: data.error }),
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
