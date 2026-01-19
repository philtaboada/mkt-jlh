'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { channelTypeIcons } from './constants';
import { Dispatch, SetStateAction } from 'react';

type FilterType = 'all' | 'open' | 'pending' | 'resolved' | 'snoozed';
type ChannelFilter = 'all' | string;

interface ActiveChannel {
  id: string;
  name: string;
  type: string;
}

interface ConversationFiltersProps {
  activeChannels: ActiveChannel[];
  channelFilter: ChannelFilter;
  setChannelFilter: (filter: ChannelFilter) => void;
  channelStats: Record<string, number>;
  filter: FilterType;
  setFilter: Dispatch<SetStateAction<FilterType>>;
  conversationCounts: Record<string, number>;
}

export function ConversationFilters({
  activeChannels,
  channelFilter,
  setChannelFilter,
  channelStats,
  filter,
  setFilter,
  conversationCounts,
}: ConversationFiltersProps) {
  const selectedChannelLabel = (() => {
    if (channelFilter === 'all') {
      return 'Todos los canales';
    }
    const selectedChannel = activeChannels.find((channel) => channel.id === channelFilter);
    return selectedChannel?.name || 'Canal';
  })();

  const selectedStatusLabel = (() => {
    if (filter === 'all') {
      return 'Todos los estados';
    }
    if (filter === 'open') {
      return '🟢 Abiertos';
    }
    if (filter === 'pending') {
      return '🟡 Pendientes';
    }
    if (filter === 'resolved') {
      return '⚪ Resueltos';
    }
    return '⏸️ Pospuestos';
  })();

  return (
    <>
      {/* Channel Filter Tabs */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1">
          {activeChannels.map((channel: ActiveChannel) => {
            const typeConfig = channelTypeIcons[channel.type] || {
              icon: '🔗',
              bgColor: 'bg-gray-500',
            };
            const isSelected = channelFilter === channel.id;
            return (
              <Button
                key={channel.id}
                variant={isSelected ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'h-6 px-2 text-xs font-medium whitespace-nowrap shrink-0 rounded-full',
                  isSelected && 'bg-muted shadow-sm'
                )}
                onClick={() => setChannelFilter(channel.id)}
              >
                <span className="mr-1 text-xs">{typeConfig.icon}</span>
                <span className="truncate max-w-16">{channel.name}</span>
                <Badge variant="secondary" className="ml-1 h-3 px-1 text-[9px] leading-none">
                  {channelStats[channel.id] || 0}
                </Badge>
              </Button>
            );
          })}
          {/* Opción para ver todos al final */}
          <Button
            variant={channelFilter === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'h-6 px-2 text-xs font-medium whitespace-nowrap shrink-0 rounded-full',
              channelFilter === 'all' && 'bg-muted shadow-sm'
            )}
            onClick={() => setChannelFilter('all')}
          >
            <span className="truncate max-w-12">Todos</span>
            <Badge variant="secondary" className="ml-1 h-3 px-1 text-[9px] leading-none">
              {channelStats.all || 0}
            </Badge>
          </Button>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-border bg-muted/30 text-[11px] text-muted-foreground flex items-center gap-2">
        <Badge variant="secondary" className="h-5 px-2 text-[10px]">
          Canal: {selectedChannelLabel}
        </Badge>
        <Badge variant="secondary" className="h-5 px-2 text-[10px]">
          Estado: {selectedStatusLabel}
        </Badge>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border overflow-x-auto scrollbar-thin">
        {(['all', 'open', 'pending', 'resolved'] as const).map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'h-6 px-2 text-xs font-medium whitespace-nowrap shrink-0 rounded-full',
              filter === filterType && 'bg-muted shadow-sm'
            )}
            onClick={() => setFilter(filterType)}
          >
            {filterType === 'all' && 'Todos'}
            {filterType === 'open' && '🟢 Abiertos'}
            {filterType === 'pending' && '🟡 Pendientes'}
            {filterType === 'resolved' && '⚪ Resueltos'}
            {conversationCounts[filterType] > 0 && (
              <Badge variant="secondary" className="ml-1 h-3 px-1 text-[9px] leading-none">
                {conversationCounts[filterType]}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </>
  );
}
