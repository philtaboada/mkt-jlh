import { NextRequest, NextResponse } from 'next/server';
import { getChannelByWidgetToken } from '@/features/chat/api/channels.api';
import { findOrCreateWidgetConversation } from '@/features/chat/api/conversation.api';
import { createWidgetMessage, getLastMessage } from '@/features/chat/api/message.api';
import { processIncomingMessage, isAIEnabledForChannel } from '@/lib/services/ai';
import type { WebsiteWidgetConfig } from '@/features/chat/types/settings';
import { getCorsHeaders } from '@/lib/utils/cors';

// Manejar preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request, 'POST, OPTIONS'),
  });
}

// POST - Enviar un nuevo mensaje y obtener respuesta
export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request, 'POST, OPTIONS');
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

    // Verificar si hay un agente activo ANTES de guardar el mensaje del usuario
    const channelConfig = channel.config as WebsiteWidgetConfig;
    console.log('AI: Configuración del canal:', {
      ai_enabled: channelConfig.ai_enabled,
      has_ai_config: !!channelConfig.ai_config,
      response_mode: channelConfig.ai_config?.response_mode,
    });

    let shouldProcessWithAI = false;

    if (isAIEnabledForChannel(channelConfig)) {
      console.log('AI: IA habilitada para este canal');
      const lastMessage = await getLastMessage(conversationId);

      if (!lastMessage) {
        console.log('AI: No hay mensajes previos, procesando con IA');
        shouldProcessWithAI = true;
      } else if (lastMessage.sender_type === 'bot' || lastMessage.sender_type === 'user') {
        console.log('AI: Último mensaje es de bot/usuario, procesando con IA');
        shouldProcessWithAI = true;
      } else if (lastMessage.sender_type === 'agent') {
        console.log('AI: Último mensaje es de un agente, no procesando con IA');
        shouldProcessWithAI = false;
      }
    } else {
      console.log('AI: IA no habilitada para este canal');
    }

    // Guardar mensaje del usuario (visitor)
    await createWidgetMessage({
      conversationId,
      body: message,
      senderId: visitor_id,
      senderType: 'user',
    });

    // Procesar respuesta de IA en background (no esperar)
    if (shouldProcessWithAI) {
      console.log('AI: Procesando mensaje con IA para conversación:', conversationId);
      // No esperar la respuesta, procesar en background
      processIncomingMessage({
        conversationId,
        userMessage: message,
        channelConfig,
        contactName: visitor_info?.name,
        channel: 'website',
        autoSaveReply: true,
      }).catch((error) => {
        console.error('Error processing AI message:', error);
      });
    } else {
      console.log('AI: No se procesará con IA para conversación:', conversationId);
    }
    return NextResponse.json(
      {
        success: true,
        conversation_id: conversationId,
        handoff_to_human: false,
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
