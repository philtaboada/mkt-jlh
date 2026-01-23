import { NextRequest, NextResponse } from 'next/server';
import { getChannelByWidgetToken } from '@/features/chat/api/channels.api';
import { findOrCreateWidgetConversation } from '@/features/chat/api/conversation.api';
import {
  getMessagesAfter,
  createWidgetMessage,
  createAutoReplyMessage,
} from '@/features/chat/api/message.api';
import type { WebsiteWidgetConfig } from '@/features/chat/types/settings';
import { getCorsHeaders } from '@/lib/utils/cors';

// Manejar preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request, 'GET, POST, OPTIONS'),
  });
}

// GET - Obtener mensajes de una conversación
export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request, 'GET, POST, OPTIONS');
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversation_id');
  const token = searchParams.get('token');
  const lastMessageId = searchParams.get('last_message_id');

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400, headers: corsHeaders });
  }

  if (!conversationId) {
    return NextResponse.json({ messages: [] }, { headers: corsHeaders });
  }

  try {
    // Validar token
    const channel = await getChannelByWidgetToken(token);

    if (!channel) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404, headers: corsHeaders });
    }

    // Obtener mensajes
    const messages = await getMessagesAfter({
      conversationId,
      afterMessageId: lastMessageId || undefined,
    });

    return NextResponse.json({ messages }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error in messages GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST - Enviar un nuevo mensaje
export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request, 'GET, POST, OPTIONS');
  try {
    const body = await request.json();
    const { token, conversation_id, content, visitor_info, visitor_id } = body;

    if (!token || !content) {
      return NextResponse.json(
        { error: 'Token and content required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validar token y obtener channel
    const channel = await getChannelByWidgetToken(token);

    if (!channel) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404, headers: corsHeaders });
    }

    let activeConversationId = conversation_id;

    // Si no hay conversación, crear una nueva
    if (!activeConversationId) {
      const conversation = await findOrCreateWidgetConversation({
        channelId: channel.id,
        visitorId: visitor_id,
        visitorInfo: visitor_info,
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin'),
      });
      activeConversationId = conversation.id;
    }

    // Crear el mensaje
    const message = await createWidgetMessage({
      conversationId: activeConversationId,
      body: content,
      senderId: visitor_id,
      senderType: 'user',
    });

    // Verificar si AI está habilitado para respuesta automática
    const channelConfig = channel.config as WebsiteWidgetConfig;
    let aiResponse = null;

    if (channelConfig.ai_enabled && channelConfig.ai_config?.auto_reply) {
      const autoReply = await createAutoReplyMessage(
        activeConversationId,
        '¡Gracias por tu mensaje! Un agente te responderá pronto.'
      );
      aiResponse = autoReply;
    }

    return NextResponse.json(
      {
        success: true,
        message,
        conversation_id: activeConversationId,
        ai_response: aiResponse,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in messages POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
