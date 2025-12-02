import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const supabase = await createClient();

    // Validar token y obtener channel
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

    // Buscar conversación abierta por visitor_id en metadata
    const { data: conversations, error } = await supabase
      .from('mkt_conversations')
      .select('id, created_at, last_message_at')
      .eq('channel_id', channel.id)
      .eq('status', 'open')
      .filter('metadata->>visitor_id', 'eq', visitorId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error finding conversation:', error);
      return NextResponse.json(
        { error: 'Error finding conversation' },
        { status: 500, headers: corsHeaders }
      );
    }

    if (conversations && conversations.length > 0) {
      return NextResponse.json(
        {
          conversation_id: conversations[0].id,
          created_at: conversations[0].created_at,
          last_message_at: conversations[0].last_message_at,
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
