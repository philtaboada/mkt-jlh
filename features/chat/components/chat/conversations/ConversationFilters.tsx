'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { channelTypeIcons } from './constants';

interface ConversationFiltersProps {
  activeChannels: any[];
  channelFilter: string | null;
  setChannelFilter: (filter: string | null) => void;
  channelStats: Record<string, number>;
  filter: string;
  setFilter: (filter: string) => void;
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
  return (
    <>
      {/* Channel Filter Tabs */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1">
          {activeChannels.map((channel: any, index: number) => {
            const typeConfig = channelTypeIcons[channel.type] || {
              icon: '🔗',
              bgColor: 'bg-gray-500',
            };
            // El primer canal está seleccionado por defecto si channelFilter es null
            const isSelected =
              channelFilter === channel.id || (channelFilter === null && index === 0);
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
