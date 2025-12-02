import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const supabase = await createClient();

    // Validate token and get channel
    const { data: channels, error: channelError } = await supabase
      .from('mkt_channels')
      .select('*')
      .eq('type', 'website');

    if (channelError) {
      console.error('Error fetching channel:', channelError);
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    const channel = channels?.find((c) => {
      const config = c.config as { widget_token?: string };
      return config?.widget_token === token;
    });

    if (!channel) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404, headers: corsHeaders });
    }

    // Usar conversación existente o buscar/crear una nueva
    let conversationId: string | null = existingConversationId || null;

    if (!conversationId) {
      // Buscar conversación existente por visitor_id en metadata
      const { data: existingConvs } = await supabase
        .from('mkt_conversations')
        .select('id')
        .eq('channel_id', channel.id)
        .eq('channel', 'website')
        .eq('status', 'open')
        .filter('metadata->>visitor_id', 'eq', visitor_id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingConvs && existingConvs.length > 0) {
        conversationId = existingConvs[0].id;
      } else {
        // Crear nueva conversación
        const { data: newConv, error: convError } = await supabase
          .from('mkt_conversations')
          .insert({
            channel_id: channel.id,
            channel: 'website',
            status: 'open',
            metadata: {
              visitor_id,
              visitor_info,
              user_agent: request.headers.get('user-agent'),
              origin: request.headers.get('origin'),
            },
          })
          .select()
          .single();

        if (convError) {
          console.error('Error creating conversation:', convError);
          return NextResponse.json(
            { error: 'Error creating conversation' },
            { status: 500, headers: corsHeaders }
          );
        }

        conversationId = newConv.id;
      }
    }

    // Guardar mensaje del usuario (visitor)
    const { error: messageError } = await supabase.from('mkt_messages').insert({
      conversation_id: conversationId,
      body: message,
      sender_type: 'user',
      sender_id: visitor_id,
      type: 'text',
      status: 'sent',
    });

    if (messageError) {
      console.error('Error creating message:', messageError);
      return NextResponse.json(
        { error: 'Error saving message' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Actualizar last_message_at en la conversación
    await supabase
      .from('mkt_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Verificar si AI está habilitado para respuesta automática
    const channelConfig = channel.config as {
      ai_enabled?: boolean;
      ai_config?: {
        auto_reply?: boolean;
        provider?: string;
        model?: string;
        system_prompt?: string;
        temperature?: number;
      };
    };

    let reply: string | null = null;

    if (channelConfig.ai_enabled && channelConfig.ai_config?.auto_reply) {
      // TODO: Implementar con Vercel AI SDK
      // Por ahora, respuesta de acknowledgment
      reply = '¡Gracias por tu mensaje! Un agente te responderá pronto.';

      // Guardar respuesta automática como 'bot' (no 'agent')
      await supabase.from('mkt_messages').insert({
        conversation_id: conversationId,
        body: reply,
        sender_type: 'bot', // 'bot' para IA, 'agent' para humanos
        type: 'text',
        status: 'sent',
        metadata: { is_auto_reply: true },
      });
    }

    return NextResponse.json(
      {
        success: true,
        conversation_id: conversationId,
        reply,
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
