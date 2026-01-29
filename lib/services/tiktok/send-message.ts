export interface SendTikTokMessageParams {
  to: string; // recipient user id
  message?: string;
  type?: 'text' | 'image' | 'video' | 'file';
  mediaUrl?: string;
  caption?: string;
  accessToken?: string;
}

export interface SendTikTokMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendTikTokMessage(
  params: SendTikTokMessageParams
): Promise<SendTikTokMessageResult> {
  const { to, message, type = 'text', mediaUrl, caption, accessToken } = params;

  if (!accessToken) {
    console.error('TikTok access token not provided');
    return { success: false, error: 'TikTok not configured' };
  }
  const apiBase = 'https://business-api.tiktok.com/open_api';
  const apiVersion = 'v1.3';
  const endpoint = `${apiBase}/${apiVersion}/business/message/send/`;

  try {
    let payload: any = {
      recipient: { id: to },
      type,
    };

    if (type === 'text') {
      if (!message) throw new Error('Message text is required for text messages');
      payload.message = { text: message };
    } else {
      if (!mediaUrl) throw new Error('mediaUrl is required for media messages');
      payload.message = {
        media: {
          url: mediaUrl,
          caption: caption || undefined,
          mime_type: undefined,
        },
      };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('TikTok API error', { status: res.status, data });
      return { success: false, error: data?.error || `TikTok API returned status ${res.status}` };
    }

    // Intentar extraer ID del mensaje según respuesta
    const messageId = data?.data?.message_id || data?.message_id || data?.data?.id || undefined;

    return { success: true, messageId };
  } catch (err) {
    console.error('Error sending TikTok message', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
