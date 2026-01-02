import { NextResponse } from 'next/server';
import { getChannelsByType } from '@/features/chat/api/channels.api';
import { sendFacebookMessage } from '@/lib/services/facebook';
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
    const accessToken = config.page_access_token;
    const pageId = config.page_id;

    if (!accessToken || !pageId) {
      return NextResponse.json({ error: 'Facebook configuration not complete' }, { status: 400 });
    }

    const result = await sendFacebookMessage({
      to,
      message,
      accessToken,
      pageId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Facebook send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
