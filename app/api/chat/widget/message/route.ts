import { NextRequest, NextResponse } from 'next/server';
import { getChannelByWidgetToken } from '@/features/chat/api/channels.api';
import { findOrCreateWidgetConversation } from '@/features/chat/api/conversation.api';
import { createWidgetMessage } from '@/features/chat/api/message.api';
import { processIncomingMessage, isAIEnabledForChannel } from '@/lib/services/ai';
import type { WebsiteWidgetConfig } from '@/features/chat/types/settings';

// Headers CORS para el widget
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Manejar preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// POST - Enviar un nuevo mensaje y obtener respuesta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      token,
      message,
      visitor_id,
      visitor_info,
      conversation_id: existingConversationId,
    } = body;

    if (!token || !message) {
      return NextResponse.json(
        { error: 'Token and message required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validar token y obtener channel
    const channel = await getChannelByWidgetToken(token);

    if (!channel) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404, headers: corsHeaders });
    }

    // Obtener o crear conversación
    let conversationId = existingConversationId;

    if (!conversationId) {
      const conversation = await findOrCreateWidgetConversation({
        channelId: channel.id,
        visitorId: visitor_id,
        visitorInfo: visitor_info,
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin'),
      });
      conversationId = conversation.id;
    }

    // Guardar mensaje del usuario (visitor)
    await createWidgetMessage({
      conversationId,
      body: message,
      senderId: visitor_id,
      senderType: 'user',
    });

    // Procesar respuesta de IA si está habilitada
    // La respuesta se guarda en BD y Realtime la propagará automáticamente
    const channelConfig = channel.config as WebsiteWidgetConfig;
    let handoffToHuman = false;

    if (isAIEnabledForChannel(channelConfig)) {
      const result = await processIncomingMessage({
        conversationId,
        userMessage: message,
        channelConfig,
        contactName: visitor_info?.name,
        channel: 'website',
        autoSaveReply: true, // Guarda en BD, Realtime lo propagará
      });

      handoffToHuman = result.handoffToHuman || false;
    }

    // No devolvemos reply aquí - Realtime se encarga de mostrar el mensaje
    return NextResponse.json(
      {
        success: true,
        conversation_id: conversationId,
        handoff_to_human: handoffToHuman,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in message POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
