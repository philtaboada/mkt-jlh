import { NextResponse } from 'next/server';
import { getChannelsByType } from '@/features/chat/api/channels.api';
import { sendInstagramMessage } from '@/lib/services/instagram';
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
    const accessToken = config.access_token;
    const igUserId = config.account_id;

    if (!accessToken || !igUserId) {
      return NextResponse.json({ error: 'Instagram configuration not complete' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Instagram send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
