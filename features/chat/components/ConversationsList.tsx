'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useConversations } from '../hooks/useConversations';
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  MessageCircle,
  Clock,
  CheckCheck,
  AlertCircle,
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
type SortType = 'newest' | 'oldest' | 'waiting_longest';

const channelColors: Record<string, string> = {
  whatsapp: 'bg-emerald-500',
  facebook: 'bg-blue-500',
  instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
  website: 'bg-sky-500',
  web: 'bg-muted-foreground',
  email: 'bg-amber-500',
};

const channelIcons: Record<string, string> = {
  whatsapp: '📱',
  facebook: '👥',
  instagram: '📷',
  website: '🌐',
  web: '🌐',
  email: '✉️',
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
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');

  const { data: conversationsResult, isLoading } = useConversations();
  const conversations = conversationsResult?.data || [];

  // Obtener canales únicos
  const uniqueChannels = useMemo(() => {
    const channels = new Set<string>();
    conversations.forEach((conv: any) => {
      if (conv.channel) channels.add(conv.channel);
    });
    return Array.from(channels);
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    let filtered = conversations.filter((conv: any) => {
      const contactName =
        conv.mkt_contacts?.name ||
        (conv.metadata as { visitor_info?: { name?: string } })?.visitor_info?.name ||
        '';
      const visitorId = (conv.metadata as { visitor_id?: string })?.visitor_id || '';

      return (
        contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.channel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visitorId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter((conv: any) => conv.status === filter);
    }

    // Apply channel filter
    if (channelFilter !== 'all') {
      filtered = filtered.filter((conv: any) => conv.channel === channelFilter);
    }

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      if (sortBy === 'newest') {
        return (
          new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
        );
      } else if (sortBy === 'oldest') {
        return (
          new Date(a.last_message_at || 0).getTime() - new Date(b.last_message_at || 0).getTime()
        );
      } else {
        // waiting_longest - sort by created_at for open conversations
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
    });

    return filtered;
  }, [searchQuery, conversations, filter, channelFilter, sortBy]);

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

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-foreground">Conversaciones</h1>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
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

      {/* Filter Tabs */}
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
            {filterType === 'open' && 'Abiertos'}
            {filterType === 'pending' && 'Pendientes'}
            {filterType === 'resolved' && 'Resueltos'}
            {conversationCounts[filterType] > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                {conversationCounts[filterType]}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Sort & Filter Options */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground">
          {filteredConversations.length} conversaciones
        </span>
        <div className="flex items-center gap-1">
          {/* Channel Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                {channelFilter === 'all' ? 'Canal' : channelIcons[channelFilter] || '🔗'}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setChannelFilter('all')}>
                Todos los canales
                {channelFilter === 'all' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {uniqueChannels.map((channel) => (
                <DropdownMenuItem key={channel} onClick={() => setChannelFilter(channel)}>
                  <span className="mr-2">{channelIcons[channel] || '🔗'}</span>
                  {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  {channelFilter === channel && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                <Filter className="h-3 w-3 mr-1" />
                Ordenar
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setSortBy('newest')}>
                Más recientes primero
                {sortBy === 'newest' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                Más antiguos primero
                {sortBy === 'oldest' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('waiting_longest')}>
                Mayor tiempo de espera
                {sortBy === 'waiting_longest' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
                {filter !== 'all'
                  ? 'Prueba cambiando el filtro'
                  : 'Las conversaciones aparecerán aquí'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv: any) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
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
  isSelected: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  const status = statusConfig[conversation.status] || statusConfig.open;
  const StatusIcon = status.icon;

  // Obtener nombre del contacto o del visitante web
  const contactName =
    conversation.mkt_contacts?.name ||
    (conversation.metadata as { visitor_info?: { name?: string } })?.visitor_info?.name ||
    (conversation.channel === 'website' ? 'Visitante Web' : 'Sin nombre');

  const avatarUrl = conversation.mkt_contacts?.avatar_url;
  const avatarInitial = contactName?.charAt(0)?.toUpperCase() || '?';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 text-left transition-all duration-150 hover:bg-muted/50',
        isSelected && 'bg-primary/10 border-l-2 border-l-primary'
      )}
    >
      <div className="flex gap-3">
        {/* Avatar with channel indicator */}
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={contactName} />
            <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center text-[8px]',
              channelColors[conversation.channel] || 'bg-muted-foreground'
            )}
          >
            <span className="text-white">
              {channelIcons[conversation.channel]?.slice(0, 1) || '•'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="font-medium text-sm text-foreground truncate">{contactName}</span>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {conversation.last_message_at && formatTime(new Date(conversation.last_message_at))}
            </span>
          </div>

          {/* Last message preview */}
          <p className="text-xs text-muted-foreground truncate mb-1">
            {conversation.last_message || 'Sin mensajes'}
          </p>

          {/* Status and badges */}
          <div className="flex items-center gap-1.5">
            <div className={cn('w-1.5 h-1.5 rounded-full', status.color)} />
            <span className="text-[10px] text-muted-foreground capitalize">{status.label}</span>

            {conversation.unread_count > 0 && (
              <Badge className="h-4 px-1.5 text-[10px] bg-primary hover:bg-primary ml-auto">
                {conversation.unread_count}
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
