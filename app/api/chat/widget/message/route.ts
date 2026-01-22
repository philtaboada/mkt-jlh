import { NextRequest, NextResponse } from 'next/server';
import { getChannelByWidgetToken } from '@/features/chat/api/channels.api';
import { findOrCreateWidgetConversation } from '@/features/chat/api/conversation.api';
import { createWidgetMessage, getLastMessage } from '@/features/chat/api/message.api';
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

    // Verificar si hay un agente activo ANTES de guardar el mensaje del usuario
    const channelConfig = channel.config as WebsiteWidgetConfig;
    let shouldProcessWithAI = false;
    
    if (isAIEnabledForChannel(channelConfig)) {
      // Verificar el último mensaje antes de guardar el nuevo
      const lastMessage = await getLastMessage(conversationId);
      
      // Solo procesar con IA si:
      // 1. No hay mensajes (conversación nueva)
      // 2. El último mensaje es del bot (sender_type: 'bot')
      // 3. El último mensaje es del usuario (continuación de conversación con bot)
      // NO procesar si el último mensaje es de un agente
      if (!lastMessage || 
          lastMessage.sender_type === 'bot' || 
          lastMessage.sender_type === 'user') {
        shouldProcessWithAI = true;
      } else if (lastMessage.sender_type === 'agent') {
        console.log('AI: Último mensaje es de un agente, no procesando con IA');
        shouldProcessWithAI = false;
      }
    }

    // Guardar mensaje del usuario (visitor)
    await createWidgetMessage({
      conversationId,
      body: message,
      senderId: visitor_id,
      senderType: 'user',
    });

    // Procesar respuesta de IA solo si corresponde
    let handoffToHuman = false;

    if (shouldProcessWithAI) {
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
