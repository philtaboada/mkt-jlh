/**
 * Servicio para enviar mensajes de WhatsApp
 */

// Formatos de imagen soportados por WhatsApp Cloud API
const WHATSAPP_SUPPORTED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
] as const;

// Formatos de audio soportados por WhatsApp Cloud API
const WHATSAPP_SUPPORTED_AUDIO_MIMES = [
  'audio/aac',
  'audio/mp4',
  'audio/mpeg',
  'audio/amr',
  'audio/ogg',
  'audio/opus',
] as const;

// Formatos de video soportados por WhatsApp Cloud API
const WHATSAPP_SUPPORTED_VIDEO_MIMES = [
  'video/mp4',
  'video/3gp',
  'video/3gpp',
] as const;

// Formatos de documento soportados (más flexibles)
const WHATSAPP_SUPPORTED_DOCUMENT_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.csv',
] as const;

function isWhatsAppSupportedMedia(params: { type: string; mimeOrUrl: string }): boolean {
  const { type, mimeOrUrl } = params;
  const lowerMime = mimeOrUrl.toLowerCase();
  
  switch (type) {
    case 'image':
      return WHATSAPP_SUPPORTED_IMAGE_MIMES.some(mime => lowerMime.includes(mime));
    case 'audio':
      return WHATSAPP_SUPPORTED_AUDIO_MIMES.some(mime => lowerMime.includes(mime));
    case 'video':
      return WHATSAPP_SUPPORTED_VIDEO_MIMES.some(mime => lowerMime.includes(mime));
    case 'document':
      return true; // WhatsApp es más flexible con documentos
    case 'sticker':
      return lowerMime.includes('image/webp');
    default:
      return false;
  }
}

function extractExtensionFromUrl(params: { url: string }): string {
  const pathname = new URL(params.url).pathname;
  const ext = pathname.split('.').pop()?.toLowerCase() || '';
  return ext;
}

export interface SendWhatsAppMessageParams {
  to: string;
  message?: string;
  type?: 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker';
  mediaUrl?: string;
  caption?: string;
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
 * Envía un mensaje (texto o multimedia) por WhatsApp
 */
export async function sendWhatsAppMessage(
  params: SendWhatsAppMessageParams
): Promise<SendWhatsAppMessageResult> {
  const { to, message, type = 'text', mediaUrl, caption, accessToken, phoneNumberId } = params;
  
  if (!accessToken || !phoneNumberId) {
    console.error('WhatsApp credentials not provided');
    return { success: false, error: 'WhatsApp not configured' };
  }

  const apiUrl = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  try {
    let payload: any = {
      messaging_product: 'whatsapp',
      to,
      type,
    };

    if (type === 'text') {
      if (!message) throw new Error('Message text is required for text messages');
      payload.text = { body: message };
    } else if (['image', 'audio', 'video', 'document', 'sticker'].includes(type)) {
      if (!mediaUrl) throw new Error(`Media URL is required for ${type} messages`);
      
      // Verificar que la URL sea accesible
      const mediaHeadResponse: Response = await fetch(mediaUrl, { method: 'HEAD' });
      const contentType = mediaHeadResponse.headers.get('content-type') || '';
      const contentLength = mediaHeadResponse.headers.get('content-length');
      
      console.info('[whatsapp-send] media head', {
        to,
        type,
        status: mediaHeadResponse.status,
        contentType,
        contentLength,
        url: mediaUrl,
      });
      
      if (!mediaHeadResponse.ok) {
        return {
          success: false,
          error: `Media URL not accessible (status ${mediaHeadResponse.status})`,
        };
      }
      
      // Verificar formato soportado por WhatsApp
      const urlExtension = extractExtensionFromUrl({ url: mediaUrl });
      const isSupported = isWhatsAppSupportedMedia({ type, mimeOrUrl: contentType || urlExtension });
      
      // Determinar si el caption es válido para este tipo de media
      const canHaveCaption = type !== 'audio' && type !== 'sticker';
      
      if (!isSupported && type !== 'document') {
        console.warn('[whatsapp-send] unsupported media format, falling back to document', {
          to,
          type,
          contentType,
          urlExtension,
          url: mediaUrl,
        });
        // Enviar como documento si el tipo original no es soportado
        payload.type = 'document';
        payload.document = {
          link: mediaUrl,
          ...(caption ? { caption, filename: caption } : {}),
        };
      } else {
        // Tipo soportado o ya es documento
        payload[type] = {
          link: mediaUrl,
          ...(caption && canHaveCaption ? { caption } : {}),
        };
      }
    }

    console.info('WhatsApp API payload', {
      to,
      type,
      payload,
    });

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
        type,
      });
      return {
        success: false,
        error: buildWhatsAppErrorMessage({ status: response.status, error: data.error }),
      };
    }

    console.info('WhatsApp API success', {
      to,
      messageId: data.messages?.[0]?.id,
      type,
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
