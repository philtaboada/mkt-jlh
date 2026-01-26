import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { getChannelByWidgetToken } from '@/features/chat/api/channels.api';
import { getConversationById } from '@/features/chat/api/conversation.api';
import { getCorsHeaders } from '@/lib/utils/cors';

export const dynamic = 'force-dynamic';

// Manejar preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request, 'GET, OPTIONS'),
  });
}

export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request, 'GET, OPTIONS');
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const conversationId = searchParams.get('conversation_id');

  if (!token || !conversationId) {
    return new Response('Missing token or conversation_id', { status: 400 });
  }

  // Verificar que el token es válido usando la misma función que los otros endpoints
  const channel = await getChannelByWidgetToken(token);

  if (!channel) {
    return new Response('Invalid token', { status: 401 });
  }

  // Verificar que la conversación existe y pertenece al canal
  try {
    const conversation = await getConversationById(conversationId);
    if (!conversation || conversation.channel_id !== channel.id) {
      return new Response('Conversation not found', { status: 404 });
    }
  } catch {
    return new Response('Conversation not found', { status: 404 });
  }

  const supabase = await createClient();

  // Crear el stream SSE
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Enviar heartbeat inicial
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

      // Suscribirse a cambios en mensajes de esta conversación
      const subscription = supabase
        .channel(`widget-messages-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mkt_messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const message = payload.new;
            if (message.sender_type === 'agent' || message.sender_type === 'bot') {
              const data = JSON.stringify({
                type: 'message',
                message: {
                  id: message.id,
                  body: message.body,
                  sender_type: message.sender_type,
                  created_at: message.created_at,
                },
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            } else {
              console.log(
                '[Widget Stream] Ignoring message from sender_type:',
                message.sender_type
              );
            }
          }
        )
        .subscribe((status) => {
          console.log(
            '[Widget Stream] Subscription status:',
            status,
            'for conversation:',
            conversationId
          );
        });

      // Heartbeat cada 30 segundos para mantener la conexión
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'ping' })}\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Cleanup cuando se cierra la conexión
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        supabase.removeChannel(subscription);
        controller.close();
      });
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
}
