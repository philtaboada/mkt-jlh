'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useConversations } from '../hooks/useConversations';
import { useActiveChannels } from '../hooks/useChannels';
import {
  Search,
  MessageCircle,
  Clock,
  CheckCheck,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

type FilterType = 'all' | 'open' | 'pending' | 'resolved' | 'snoozed';
type SortType = 'newest' | 'oldest' | 'unread_first';

// Iconos por tipo de canal
const channelTypeIcons: Record<string, { icon: string; bgColor: string }> = {
  whatsapp: { icon: '📱', bgColor: 'bg-emerald-500' },
  facebook: { icon: '👥', bgColor: 'bg-blue-500' },
  instagram: { icon: '📷', bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  website: { icon: '🌐', bgColor: 'bg-sky-500' },
  web: { icon: '🌐', bgColor: 'bg-gray-500' },
  email: { icon: '✉️', bgColor: 'bg-amber-500' },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: 'Abierto', color: 'bg-emerald-500', icon: MessageCircle },
  pending: { label: 'Pendiente', color: 'bg-amber-500', icon: Clock },
  resolved: { label: 'Resuelto', color: 'bg-muted-foreground', icon: CheckCheck },
  snoozed: { label: 'Pospuesto', color: 'bg-blue-500', icon: AlertCircle },
};

export function ConversationsList({
  onSelectConversation,
  selectedConversationId,
  searchQuery,
  onSearchChange,
}: ConversationsListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [channelFilter, setChannelFilter] = useState<string | null>(null); // null = primer canal activo
  const [sortBy, setSortBy] = useState<SortType>('newest');

  const { data: conversationsResult, isLoading } = useConversations();
  const { data: activeChannels = [] } = useActiveChannels();
  const conversations = conversationsResult?.data || [];

  // Crear mapa de canales por ID para acceso rápido
  const channelsMap = useMemo(() => {
    const map: Record<string, { id: string; name: string; type: string }> = {};
    activeChannels.forEach((ch: any) => {
      map[ch.id] = { id: ch.id, name: ch.name, type: ch.type };
    });
    return map;
  }, [activeChannels]);

  // Obtener conteo por canal (usando channel_id de las conversaciones)
  const channelStats = useMemo(() => {
    const stats: Record<string, number> = { all: conversations.length };
    conversations.forEach((conv: any) => {
      const channelId = conv.channel_id;
      if (channelId) {
        stats[channelId] = (stats[channelId] || 0) + 1;
      }
    });
    return stats;
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    let filtered = conversations.filter((conv: any) => {
      const contactName =
        conv.mkt_contacts?.name ||
        (conv.metadata as { visitor_info?: { name?: string } })?.visitor_info?.name ||
        '';

      return (
        contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.channel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter((conv: any) => conv.status === filter);
    }

    // Apply channel filter (by channel_id)
    // Si channelFilter es null, usar el primer canal activo
    const effectiveChannelFilter =
      channelFilter === null && activeChannels.length > 0 ? activeChannels[0].id : channelFilter;

    if (effectiveChannelFilter && effectiveChannelFilter !== 'all') {
      filtered = filtered.filter((conv: any) => conv.channel_id === effectiveChannelFilter);
    }

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      if (sortBy === 'unread_first') {
        // Primero los no leídos
        if ((b.unread_count || 0) !== (a.unread_count || 0)) {
          return (b.unread_count || 0) - (a.unread_count || 0);
        }
      }
      if (sortBy === 'newest' || sortBy === 'unread_first') {
        return (
          new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
        );
      } else {
        return (
          new Date(a.last_message_at || 0).getTime() - new Date(b.last_message_at || 0).getTime()
        );
      }
    });

    return filtered;
  }, [searchQuery, conversations, filter, channelFilter, sortBy, activeChannels]);

  const conversationCounts = useMemo(() => {
    return {
      all: conversations.length,
      open: conversations.filter((c: any) => c.status === 'open').length,
      pending: conversations.filter((c: any) => c.status === 'pending').length,
      resolved: conversations.filter((c: any) => c.status === 'resolved' || c.status === 'closed')
        .length,
      snoozed: conversations.filter((c: any) => c.status === 'snoozed').length,
    };
  }, [conversations]);

  const totalUnread = useMemo(() => {
    return conversations.reduce((acc: number, c: any) => acc + (c.unread_count || 0), 0);
  }, [conversations]);

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">Conversaciones</h1>
            {totalUnread > 0 && (
              <Badge className="h-5 px-1.5 text-xs bg-primary">{totalUnread}</Badge>
            )}
          </div>
          {/* Ordenar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setSortBy('newest')}>
                Más recientes
                {sortBy === 'newest' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                Más antiguos
                {sortBy === 'oldest' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('unread_first')}>
                No leídos primero
                {sortBy === 'unread_first' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Channel Filter Tabs */}
      <div className="px-2 py-2 border-b border-border">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
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
                  'h-7 px-2 text-xs font-medium whitespace-nowrap shrink-0',
                  isSelected && 'bg-muted'
                )}
                onClick={() => setChannelFilter(channel.id)}
              >
                <span className="mr-1">{typeConfig.icon}</span>
                {channel.name}
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
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
              'h-7 px-3 text-xs font-medium whitespace-nowrap shrink-0',
              channelFilter === 'all' && 'bg-muted'
            )}
            onClick={() => setChannelFilter('all')}
          >
            Todos
            <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
              {channelStats.all || 0}
            </Badge>
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 px-2 py-2 border-b border-border overflow-x-auto">
        {(['all', 'open', 'pending', 'resolved'] as FilterType[]).map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'h-7 px-3 text-xs font-medium whitespace-nowrap',
              filter === filterType && 'bg-muted'
            )}
            onClick={() => setFilter(filterType)}
          >
            {filterType === 'all' && 'Todos'}
            {filterType === 'open' && '🟢 Abiertos'}
            {filterType === 'pending' && '🟡 Pendientes'}
            {filterType === 'resolved' && '⚪ Resueltos'}
            {conversationCounts[filterType] > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                {conversationCounts[filterType]}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Results count */}
      <div className="px-4 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground">
          {filteredConversations.length} conversaciones
        </span>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Cargando conversaciones...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No hay conversaciones</p>
              <p className="text-xs text-muted-foreground mt-1">
                {filter !== 'all' || channelFilter !== 'all'
                  ? 'Prueba cambiando los filtros'
                  : 'Las conversaciones aparecerán aquí'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv: any) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                channelsMap={channelsMap}
                isSelected={selectedConversationId === conv.id}
                onClick={() => onSelectConversation(conv.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ConversationItemProps {
  conversation: any;
  channelsMap: Record<string, { id: string; name: string; type: string }>;
  isSelected: boolean;
  onClick: () => void;
}

function ConversationItem({
  conversation,
  channelsMap,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const status = statusConfig[conversation.status] || statusConfig.open;

  // Obtener info del canal - primero del join, luego del mapa, luego fallback
  const channelFromJoin = conversation.mkt_channels;
  const channelFromMap = channelsMap[conversation.channel_id];
  const channelInfo = channelFromJoin || channelFromMap;
  const channelType = channelInfo?.type || conversation.channel || 'web';
  const typeConfig = channelTypeIcons[channelType] || { icon: '🔗', bgColor: 'bg-gray-500' };

  const hasUnread = (conversation.unread_count || 0) > 0;

  // Obtener nombre del contacto o del visitante web
  const contactName =
    conversation.mkt_contacts?.name ||
    (conversation.metadata as { visitor_info?: { name?: string } })?.visitor_info?.name ||
    (conversation.channel === 'website' || channelType === 'website'
      ? 'Visitante Web'
      : 'Sin nombre');

  const avatarUrl = conversation.mkt_contacts?.avatar_url;
  const avatarInitial = contactName?.charAt(0)?.toUpperCase() || '?';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 text-left transition-all duration-150 hover:bg-muted/50',
        isSelected && 'bg-primary/10 border-l-2 border-l-primary',
        hasUnread && !isSelected && 'bg-primary/5'
      )}
    >
      <div className="flex gap-3">
        {/* Avatar with channel indicator */}
        <div className="relative shrink-0">
          <Avatar className="h-11 w-11">
            <AvatarImage src={avatarUrl} alt={contactName} />
            <AvatarFallback
              className={cn(
                'text-sm font-medium',
                hasUnread ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              )}
            >
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-[10px]',
              typeConfig.bgColor
            )}
            title={channelInfo?.name || channelType}
          >
            <span>{typeConfig.icon}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span
              className={cn(
                'text-sm truncate',
                hasUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground'
              )}
            >
              {contactName}
            </span>
            <span
              className={cn(
                'text-[10px] shrink-0',
                hasUnread ? 'text-primary font-medium' : 'text-muted-foreground'
              )}
            >
              {conversation.last_message_at && formatTime(new Date(conversation.last_message_at))}
            </span>
          </div>

          {/* Last message preview */}
          <p
            className={cn(
              'text-xs truncate mb-1.5',
              hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}
          >
            {conversation.last_message || 'Sin mensajes'}
          </p>

          {/* Status, channel tag and unread badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className={cn('w-1.5 h-1.5 rounded-full', status.color)} />
              <span className="text-[10px] text-muted-foreground">{status.label}</span>
              <Badge
                variant="outline"
                className={cn(
                  'h-4 px-1.5 text-[9px] font-normal border-0',
                  typeConfig.bgColor,
                  'text-white'
                )}
              >
                {typeConfig.icon} {channelInfo?.name || channelType}
              </Badge>
            </div>

            {hasUnread && (
              <Badge className="h-5 min-w-5 px-1.5 text-[10px] bg-primary hover:bg-primary font-bold">
                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
