'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { channelTypeIcons } from './constants';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, Inbox, Link, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  channelStats?: Record<string, number>;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
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
  const getStatusInfo = (type: FilterType) => {
    switch (type) {
      case 'open':
        return { label: 'Abiertos', icon: MessageSquare, color: 'text-emerald-500' };
      case 'pending':
        return { label: 'Pendientes', icon: Clock, color: 'text-amber-500' };
      case 'resolved':
        return { label: 'Resueltos', icon: CheckCircle2, color: 'text-slate-400' };
      case 'snoozed':
        return { label: 'Pospuestos', icon: AlertCircle, color: 'text-blue-500' };
      default:
        return { label: 'Todos', icon: Inbox, color: 'text-primary' };
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-background">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 text-muted-foreground shrink-0 border border-transparent">
        <Filter className="w-4 h-4" />
      </div>

      <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
        {/* Channel Filter */}
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="h-8 w-full text-xs font-medium bg-muted/30 hover:bg-muted/50 border-border/50 px-2 [&>span]:min-w-0">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              <div className="flex items-center gap-2 w-full min-w-0">
                <Inbox className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">Todos</span>
                {(channelStats?.all || 0) > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-auto text-[9px] h-4 px-1 min-w-4 justify-center shrink-0"
                  >
                    {channelStats?.all}
                  </Badge>
                )}
              </div>
            </SelectItem>
            {activeChannels.map((channel) => {
              const typeConfig = channelTypeIcons[channel.type] || {
                icon: Link,
              };
              const IconComponent = typeConfig.icon;
              return (
                <SelectItem key={channel.id} value={channel.id} className="text-xs">
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <IconComponent className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{channel.name}</span>
                    {(channelStats?.[channel.id] || 0) > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-auto text-[9px] h-4 px-1 min-w-4 justify-center shrink-0"
                      >
                        {channelStats?.[channel.id]}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filter} onValueChange={(val) => setFilter(val as FilterType)}>
          <SelectTrigger className="h-8 w-full text-xs font-medium bg-muted/30 hover:bg-muted/50 border-border/50 px-2 [&>span]:min-w-0">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {(['all', 'open', 'pending', 'resolved', 'snoozed'] as const).map((filterType) => {
              if (filterType === 'snoozed' && !conversationCounts['snoozed']) return null;

              const info = getStatusInfo(filterType);
              const StatusIcon = info.icon;
              return (
                <SelectItem key={filterType} value={filterType} className="text-xs">
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <StatusIcon className={cn('w-3.5 h-3.5 shrink-0', info.color)} />
                    <span>{info.label}</span>
                    {conversationCounts[filterType] > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-auto text-[9px] h-4 px-1 min-w-4 justify-center shrink-0"
                      >
                        {conversationCounts[filterType]}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
