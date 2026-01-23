'use client';

/**
 * Funciones client-side para enviar mensajes a WhatsApp
 * Nota: sendFirstMessageWithTemplate está en whatsapp-message.api.ts como server action
 */

/**
 * Envía un mensaje de texto a WhatsApp
 */
export async function sendWhatsAppTextMessage(params: {
  to: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: params.to,
        message: params.message,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al enviar mensaje');
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Envía un archivo multimedia a WhatsApp
 */
export async function sendWhatsAppMediaMessage(params: {
  to: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mediaUrl: string;
  caption?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: params.to,
        type: params.type,
        mediaUrl: params.mediaUrl,
        caption: params.caption,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al enviar archivo');
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
