/**
 * Servicio para enviar mensajes de Meta (Messenger e Instagram)
 */

export interface SendMetaMessageParams {
  to: string;
  message: string;
  accessToken: string;
  pageId?: string; // for Messenger
  recipientType: 'messenger' | 'instagram';
}

export interface SendMetaMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envía un mensaje de texto por Meta API
 */
export async function sendMetaMessage(
  params: SendMetaMessageParams
): Promise<SendMetaMessageResult> {
  const { to, message, accessToken, pageId, recipientType } = params;

  if (!accessToken) {
    console.error('Meta access token not provided');
    return { success: false, error: 'Meta not configured' };
  }

  let apiUrl: string;
  let payload: any;

  if (recipientType === 'messenger') {
    if (!pageId) {
      return { success: false, error: 'Page ID required for Messenger' };
    }
    apiUrl = `https://graph.facebook.com/v22.0/${pageId}/messages`;
    payload = {
      recipient: { id: to },
      message: { text: message },
      messaging_type: 'RESPONSE',
    };
  } else if (recipientType === 'instagram') {
    apiUrl = `https://graph.facebook.com/v22.0/${to}/messages`;
    payload = {
      message: { text: message },
    };
  } else {
    return { success: false, error: 'Invalid recipient type' };
  }

  try {
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
      console.error('Meta API error:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to send message',
      };
    }

    return {
      success: true,
      messageId: data.message_id || data.id,
    };
  } catch (error) {
    console.error('Error sending Meta message:', error);
    return {
      success: false,
      error: 'Network error',
    };
  }
}
