import { NextRequest, NextResponse } from 'next/server';
import { getWidgetConfig } from '@/features/chat/api/channels.api';

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
    const config = await getWidgetConfig(token);

    if (!config) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(
      {
        welcome_title: config.welcome_title,
        welcome_message: config.welcome_message,
        widget_color: config.widget_color,
        position: config.position,
        reply_time: config.reply_time,
        online_status: config.online_status,
        pre_chat_form_enabled: config.pre_chat_form_enabled,
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
