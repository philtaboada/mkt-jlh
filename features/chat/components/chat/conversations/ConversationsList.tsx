'use client';

import { useMemo, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';
import { useConversations } from '../../../hooks/useConversations';
import { useActiveChannels } from '../../../hooks/useChannels';
import { ConversationHeader } from './ConversationHeader';
import { ConversationFilters } from './ConversationFilters';
import { ConversationItem } from './ConversationItem';

type FilterType = 'all' | 'open' | 'pending' | 'resolved' | 'snoozed';
type SortType = 'newest' | 'oldest' | 'unread_first';

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

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
  console.log('Filtered Conversations:', filteredConversations);
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
      <ConversationHeader
        totalUnread={totalUnread}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <ConversationFilters
        activeChannels={activeChannels}
        channelFilter={channelFilter}
        setChannelFilter={setChannelFilter}
        channelStats={channelStats}
        filter={filter}
        setFilter={setFilter}
        conversationCounts={conversationCounts}
      />

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
