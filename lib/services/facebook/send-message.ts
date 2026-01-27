/**
 * Facebook Messenger Service
 * Envía mensajes a un PSID usando Graph API
 */

export type MessengerMessageType = 'text' | 'image' | 'audio' | 'video' | 'file';

export type MessengerTag = 'HUMAN_AGENT' | 'POST_PURCHASE_UPDATE' | 'CONFIRMED_EVENT_UPDATE';

/* =======================
 * Request / Response
 * ======================= */

export interface SendFacebookMessageParams {
  to: string; // PSID
  type?: MessengerMessageType;
  message?: string; // requerido si type === 'text'
  mediaUrl?: string; // requerido si type !== 'text'
  tag?: MessengerTag;
  accessToken: string;
}

export interface SendFacebookMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/* =======================
 * Messenger Payload Types
 * ======================= */

interface MessengerRecipient {
  id: string;
}

interface MessengerTextMessage {
  text: string;
}

interface MessengerAttachmentPayload {
  url: string;
  is_reusable?: boolean;
}

interface MessengerAttachment {
  type: Exclude<MessengerMessageType, 'text'>;
  payload: MessengerAttachmentPayload;
}

interface MessengerMessage {
  text?: string;
  attachment?: MessengerAttachment;
}

interface MessengerSendPayload {
  recipient: MessengerRecipient;
  message: MessengerMessage;
  tag?: MessengerTag;
}

/* =======================
 * Main function
 * ======================= */

export async function sendFacebookMessage(
  params: SendFacebookMessageParams
): Promise<SendFacebookMessageResult> {
  const { to, type = 'text', message, mediaUrl, tag, accessToken } = params;

  /* ========= Validaciones ========= */

  if (!accessToken) {
    return { success: false, error: 'Facebook not configured' };
  }

  if (!to) {
    return { success: false, error: 'Recipient PSID is required' };
  }

  if (type === 'text' && !message) {
    return {
      success: false,
      error: 'Text message is required when type is "text"',
    };
  }

  if (type !== 'text' && !mediaUrl) {
    return {
      success: false,
      error: `mediaUrl is required when type is "${type}"`,
    };
  }

  /* ========= Payload ========= */

  const payload: MessengerSendPayload = {
    recipient: { id: to },
    message:
      type === 'text'
        ? { text: message! }
        : {
            attachment: {
              type,
              payload: {
                url: mediaUrl!,
                is_reusable: true,
              },
            },
          },
    // Default to HUMAN_AGENT to allow replying after 24h window
    tag: tag || 'HUMAN_AGENT', 
  };

  /* ========= Request ========= */

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/me/messages?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data: {
      message_id?: string;
      error?: { message?: string; type?: string; code?: number; error_subcode?: number };
    } = await response.json();

    if (!response.ok) {
      console.error('[Messenger API Error]', {
        status: response.status,
        error: data?.error,
        payload,
      });
      return {
        success: false,
        error: data?.error?.message || 'Failed to send Messenger message',
      };
    }

    return {
      success: true,
      messageId: data.message_id,
    };
  } catch (error) {
    console.error('[Messenger Send Error]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
