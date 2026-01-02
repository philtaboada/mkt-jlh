import { NextResponse } from 'next/server';
import { getChannelsByType } from '@/features/chat/api/channels.api';
import type { FacebookConfig } from '@/features/chat/types/settings';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing required fields: to, message' }, { status: 400 });
    }

    const facebookChannels = await getChannelsByType('facebook');
    const activeChannel = facebookChannels.find((ch) => ch.status === 'active');

    if (!activeChannel) {
      return NextResponse.json(
        { error: 'Facebook channel not configured or inactive' },
        { status: 400 }
      );
    }

    const config = activeChannel.config as FacebookConfig;
    const PAGE_ACCESS_TOKEN = config.page_access_token;

    if (!PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Facebook access token not configured' }, { status: 400 });
    }

    const payload = {
      recipient: {
        id: to,
      },
      message: {
        text: message,
      },
    };

    const response = await fetch(
      `https://graph.facebook.com/v22.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
