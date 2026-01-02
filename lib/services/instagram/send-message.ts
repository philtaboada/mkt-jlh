/**
 * Servicio para enviar mensajes de Instagram Direct Messages
 */

export interface SendInstagramMessageParams {
  to: string;
  message: string;
  accessToken: string;
  igUserId: string;
}

export interface SendInstagramMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envía un mensaje de texto por Instagram Direct Messages
 */
export async function sendInstagramMessage(
  params: SendInstagramMessageParams
): Promise<SendInstagramMessageResult> {
  const { to, message, accessToken, igUserId } = params;

  if (!accessToken || !igUserId) {
    console.error('Instagram credentials not provided');
    return { success: false, error: 'Instagram not configured' };
  }

  const apiUrl = `https://graph.instagram.com/v22.0/${igUserId}/messages`;

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
      console.error('Instagram API error:', data);
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
    console.error('Error sending Instagram message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
