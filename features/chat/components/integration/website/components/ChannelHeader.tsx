'use client';

import Link from 'next/link';
import { ArrowLeft, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChannelHeaderProps {
  channel: {
    name: string;
    status: string;
  };
}

export function ChannelHeader({ channel }: ChannelHeaderProps) {
  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/chat/settings/integrations">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{channel.name}</h1>
              <p className="text-sm text-muted-foreground">Configuración del widget de chat</p>
            </div>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            channel.status === 'active'
              ? 'bg-emerald-500/10 text-emerald-600'
              : 'bg-amber-500/10 text-amber-600'
          )}
        >
          {channel.status === 'active' ? 'Activo' : 'Pendiente'}
        </Badge>
      </div>
    </div>
  );
}
