/**
 * Servicio para enviar mensajes de Facebook
 */

export interface SendFacebookMessageParams {
  to: string;
  message: string;
  accessToken: string;
  pageId: string;
}

export interface SendFacebookMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envía un mensaje de texto por Facebook Messenger
 */
export async function sendFacebookMessage(
  params: SendFacebookMessageParams
): Promise<SendFacebookMessageResult> {
  const { to, message, accessToken, pageId } = params;

  if (!accessToken || !pageId) {
    console.error('Facebook credentials not provided');
    return { success: false, error: 'Facebook not configured' };
  }

  const apiUrl = `https://graph.instagram.com/v22.0/${pageId}/messages`;

  try {
    const payload = {
      recipient: { id: to },
      message: { text: message },
    };

    const response = await fetch(`${apiUrl}?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Facebook API error:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to send message',
      };
    }

    return {
      success: true,
      messageId: data.message_id,
    };
  } catch (error) {
    console.error('Error sending Facebook message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
