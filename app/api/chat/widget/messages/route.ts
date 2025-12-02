import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Headers CORS para el widget
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Manejar preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET - Obtener mensajes de una conversación
export async function GET(request: NextRequest) {
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
    const supabase = await createClient();

    // Validar token
    const { data: channels } = await supabase
      .from('mkt_channels')
      .select('id, config')
      .eq('type', 'website');

    const channel = channels?.find((c) => {
      const config = c.config as { widget_token?: string };
      return config?.widget_token === token;
    });

    if (!channel) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404, headers: corsHeaders });
    }

    // Construir query de mensajes
    let query = supabase
      .from('mkt_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    // Si hay un último mensaje, solo obtener los nuevos
    if (lastMessageId) {
      const { data: lastMsg } = await supabase
        .from('mkt_messages')
        .select('created_at')
        .eq('id', lastMessageId)
        .single();

      if (lastMsg) {
        query = query.gt('created_at', lastMsg.created_at);
      }
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Error fetching messages' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({ messages: messages || [] }, { headers: corsHeaders });
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
  try {
    const body = await request.json();
    const { token, conversation_id, content, visitor_info } = body;

    if (!token || !content) {
      return NextResponse.json({ error: 'Token and content required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Validate token and get channel
    const { data: channels, error: channelError } = await supabase
      .from('mkt_channels')
      .select('*')
      .eq('type', 'website');

    if (channelError) {
      console.error('Error fetching channel:', channelError);
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    const channel = channels?.find((c) => {
      const config = c.config as { widget_token?: string };
      return config?.widget_token === token;
    });

    if (!channel) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    let activeConversationId = conversation_id;

    // Si no hay conversación, crear una nueva
    if (!activeConversationId) {
      // Buscar o crear contacto del visitante
      let contactId: string | null = null;

      if (visitor_info?.email) {
        const { data: existingContact } = await supabase
          .from('mkt_contacts')
          .select('id')
          .eq('email', visitor_info.email)
          .single();

        if (existingContact) {
          contactId = existingContact.id;
        } else {
          const { data: newContact, error: contactError } = await supabase
            .from('mkt_contacts')
            .insert({
              email: visitor_info.email,
              name: visitor_info.name || 'Visitante',
              phone: visitor_info.phone || null,
              source: 'website_widget',
            })
            .select()
            .single();

          if (!contactError && newContact) {
            contactId = newContact.id;
          }
        }
      }

      // Crear conversación
      const { data: newConversation, error: convError } = await supabase
        .from('mkt_conversations')
        .insert({
          channel_id: channel.id,
          contact_id: contactId,
          status: 'open',
          priority: 'medium',
          metadata: {
            visitor_info,
            user_agent: request.headers.get('user-agent'),
            origin: request.headers.get('origin'),
          },
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return NextResponse.json({ error: 'Error creating conversation' }, { status: 500 });
      }

      activeConversationId = newConversation.id;
    }

    // Crear el mensaje
    const { data: message, error: messageError } = await supabase
      .from('mkt_messages')
      .insert({
        conversation_id: activeConversationId,
        content,
        sender_type: 'contact', // mensaje del visitante
        message_type: 'text',
        status: 'sent',
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error creating message:', messageError);
      return NextResponse.json({ error: 'Error creating message' }, { status: 500 });
    }

    // Verificar si AI está habilitado para respuesta automática
    const channelConfig = channel.config as {
      ai_enabled?: boolean;
      ai_config?: {
        auto_respond?: boolean;
        provider?: string;
        model?: string;
        system_prompt?: string;
      };
    };

    let aiResponse = null;

    if (channelConfig.ai_enabled && channelConfig.ai_config?.auto_respond) {
      // TODO: Implementar respuesta de AI con Vercel AI SDK
      // Por ahora, respuesta placeholder
      const { data: autoReply, error: replyError } = await supabase
        .from('mkt_messages')
        .insert({
          conversation_id: activeConversationId,
          content: '¡Gracias por tu mensaje! Un agente te responderá pronto.',
          sender_type: 'agent',
          message_type: 'text',
          status: 'sent',
          metadata: {
            is_auto_reply: true,
          },
        })
        .select()
        .single();

      if (!replyError) {
        aiResponse = autoReply;
      }
    }

    return NextResponse.json({
      success: true,
      message,
      conversation_id: activeConversationId,
      ai_response: aiResponse,
    });
  } catch (error) {
    console.error('Error in messages POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
