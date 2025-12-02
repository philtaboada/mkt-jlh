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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400, headers: corsHeaders });
  }

  try {
    const supabase = await createClient();

    // Find channel by widget token
    const { data: channels, error } = await supabase
      .from('mkt_channels')
      .select('*')
      .eq('type', 'website');

    if (error) {
      console.error('Error fetching channel:', error);
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Find the channel with matching token in config
    const channel = channels?.find((c) => {
      const config = c.config as { widget_token?: string };
      return config?.widget_token === token;
    });

    if (!channel) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404, headers: corsHeaders });
    }

    const config = channel.config as {
      welcome_title?: string;
      welcome_message?: string;
      widget_color?: string;
      position?: string;
      reply_time?: string;
      online_status?: string;
      pre_chat_form_enabled?: boolean;
    };

    return NextResponse.json(
      {
        welcome_title: config.welcome_title || 'Chatea con nosotros',
        welcome_message: config.welcome_message || '¡Hola! 👋 ¿En qué podemos ayudarte?',
        widget_color: config.widget_color || '#3B82F6',
        position: config.position || 'right',
        reply_time: config.reply_time || 'few_minutes',
        online_status: config.online_status || 'auto',
        pre_chat_form_enabled: config.pre_chat_form_enabled ?? true,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in widget config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
