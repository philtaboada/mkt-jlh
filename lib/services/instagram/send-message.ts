export interface SendInstagramMessageParams {
  to: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  message?: string;
  mediaUrl?: string;
  accessToken: string;
  instagramBusinessId: string;
}

export interface SendInstagramMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendInstagramMessage(
  params: SendInstagramMessageParams
): Promise<SendInstagramMessageResult> {
  const { to, type, message, mediaUrl, accessToken, instagramBusinessId } = params;

  const payload: Record<string, unknown> = {
    recipient: { id: to },
  };

  if (type === 'text') {
    payload.message = { text: message };
  } else {
    payload.message = {
      attachment: {
        type,
        payload: {
          url: mediaUrl,
          is_reusable: true,
        },
      },
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${instagramBusinessId}/messages?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[Instagram API error]', data);
      return {
        success: false,
        error: data?.error?.message || 'Failed to send Instagram message',
      };
    }

    return {
      success: true,
      messageId: data.message_id,
    };
  } catch (error) {
    console.error('[Instagram send error]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
