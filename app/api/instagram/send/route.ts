import { NextResponse } from 'next/server';
import { getChannelsByType } from '@/features/chat/api/channels.api';
import type { InstagramConfig } from '@/features/chat/types/settings';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing required fields: to, message' }, { status: 400 });
    }

    const instagramChannels = await getChannelsByType('instagram');
    const activeChannel = instagramChannels.find((ch) => ch.status === 'active');

    if (!activeChannel) {
      return NextResponse.json(
        { error: 'Instagram channel not configured or inactive' },
        { status: 400 }
      );
    }

    const config = activeChannel.config as InstagramConfig;
    const ACCESS_TOKEN = config.access_token;
    const BUSINESS_ACCOUNT_ID = config.account_id;

    if (!ACCESS_TOKEN || !BUSINESS_ACCOUNT_ID) {
      return NextResponse.json({ error: 'Instagram configuration not complete' }, { status: 400 });
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
      `https://graph.instagram.com/v22.0/${BUSINESS_ACCOUNT_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
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
