import { NextRequest } from 'next/server';
import { getChannelByWidgetToken } from '@/features/chat/api/channels.api';
import { findOrCreateWidgetConversation } from '@/features/chat/api/conversation.api';
import { createWidgetMessage, createAutoReplyMessage, getMessagesByConversation } from '@/features/chat/api/message.api';
import { AIService } from '@/lib/services/ai';
import type { WebsiteWidgetConfig } from '@/features/chat/types/settings';
import { getCorsHeaders } from '@/lib/utils/cors';

// Manejar preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request, 'POST, OPTIONS'),
  });
}

/**
 * POST - Enviar mensaje y recibir respuesta de IA en streaming
 */
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
      return new Response(
        JSON.stringify({ error: 'Token and message required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar token y obtener channel
    const channel = await getChannelByWidgetToken(token);

    if (!channel) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

    // Guardar mensaje del usuario
    await createWidgetMessage({
      conversationId,
      body: message,
      senderId: visitor_id,
      senderType: 'user',
    });

    // Verificar si AI está habilitado
    const channelConfig = channel.config as WebsiteWidgetConfig;

    if (!channelConfig.ai_enabled || !channelConfig.ai_config) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          conversation_id: conversationId,
          ai_enabled: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiConfig = channelConfig.ai_config;

    // Verificar modo de respuesta
    if (aiConfig.response_mode === 'agent_only') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          conversation_id: conversationId,
          ai_enabled: false,
          reason: 'agent_only_mode'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Crear servicio de IA
    const aiService = await AIService.create(aiConfig);

    if (!aiService) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          conversation_id: conversationId,
          ai_enabled: false,
          reason: 'no_api_key'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar handoff a humano
    if (aiService.shouldHandoffToHuman(message)) {
      const handoffMessage = 'Entiendo que prefieres hablar con un agente humano. Transfiriendo tu conversación...';
      await createAutoReplyMessage(conversationId, handoffMessage);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          conversation_id: conversationId,
          reply: handoffMessage,
          handoff_to_human: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener contexto de la conversación
    const messages = await getMessagesByConversation(conversationId);
    const context = {
      messages,
      contactName: visitor_info?.name,
      channel: 'website',
    };

    // Generar respuesta con streaming
    const textStream = await aiService.generateStreamResponse(message, context);

    // Crear el stream de respuesta
    let fullResponse = '';
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Enviar conversation_id primero
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'start', conversation_id: conversationId })}\n\n`)
        );

        try {
          const reader = textStream.getReader();

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Guardar la respuesta completa
              if (fullResponse) {
                await createAutoReplyMessage(conversationId, fullResponse);
              }
              
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'done', full_response: fullResponse })}\n\n`)
              );
              controller.close();
              break;
            }

            fullResponse += value;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: value })}\n\n`)
            );
          }
        } catch (error) {
          console.error('Streaming error:', error);
          const fallback = aiService.getFallbackMessage();
          await createAutoReplyMessage(conversationId, fallback);
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', fallback })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in AI stream POST:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
