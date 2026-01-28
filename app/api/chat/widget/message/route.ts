import { NextRequest, NextResponse } from 'next/server';
import { getChannelByWidgetToken } from '@/features/chat/api/channels.api';
import {
  findOrCreateWidgetConversation,
  getConversationById,
} from '@/features/chat/api/conversation.api';
import { createWidgetMessage } from '@/features/chat/api/message.api';
import { processIncomingMessage } from '@/lib/services/ai';
import type { WebsiteWidgetConfig } from '@/features/chat/types/settings';
import { getCorsHeaders } from '@/lib/utils/cors';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request, 'POST, OPTIONS'),
  });
}

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

    const channel = await getChannelByWidgetToken(token);

    if (!channel) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404, headers: corsHeaders });
    }

    let conversationId = existingConversationId;

    if (!conversationId) {
      const conversation = await findOrCreateWidgetConversation({
        channelId: channel.id,
        visitorId: visitor_id,
        visitorInfo: visitor_info,
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin'),
        ia_enabled: true,
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

    const conversation = await getConversationById(conversationId);
    const conversationIaEnabled = conversation?.ia_enabled;
    await createWidgetMessage({
      conversationId,
      body: message,
      senderId: visitor_id,
      senderType: 'user',
    });
    // Determinar si se debe procesar con IA
    if (conversationIaEnabled) {
      console.log('AI: IA habilitada a nivel de conversación.');

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
