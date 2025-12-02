'use client';

import { WebsiteChannelConfig } from '@/features/chat/components/integration';
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function WebsiteChannelConfigPage({ params }: PageProps) {
  const { id } = use(params);
  return <WebsiteChannelConfig channelId={id} />;
}
