import { NextRequest, NextResponse } from 'next/server';
import { getChannelByWidgetToken } from '@/features/chat/api/channels.api';
import { findWidgetConversation } from '@/features/chat/api/conversation.api';

// Headers CORS para el widget
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Manejar preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET - Buscar conversación existente por visitor_id
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const visitorId = searchParams.get('visitor_id');

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400, headers: corsHeaders });
  }

  if (!visitorId) {
    return NextResponse.json(
      { error: 'visitor_id required' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    // Validar token y obtener channel
    const channel = await getChannelByWidgetToken(token);

    if (!channel) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404, headers: corsHeaders });
    }

    // Buscar conversación abierta por visitor_id
    const conversation = await findWidgetConversation({
      channelId: channel.id,
      visitorId,
    });

    if (conversation) {
      return NextResponse.json(
        {
          conversation_id: conversation.id,
          created_at: conversation.created_at,
          last_message_at: conversation.last_message_at,
        },
        { headers: corsHeaders }
      );
    }

    // No se encontró conversación
    return NextResponse.json({ conversation_id: null }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error in conversation GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
