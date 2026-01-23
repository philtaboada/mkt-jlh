'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';
import { useConversations } from '../../../hooks/useConversations';
import { useActiveChannels } from '../../../hooks/useChannels';
import { ConversationHeader } from './ConversationHeader';
import { ConversationFilters } from './ConversationFilters';
import { ConversationItem } from './ConversationItem';
import { CreateConversationDialog } from './CreateConversationDialog';

type FilterType = 'all' | 'open' | 'pending' | 'resolved' | 'snoozed';
type SortType = 'newest' | 'oldest' | 'unread_first';
type ChannelFilter = 'all' | string;

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
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: conversationsResult, isLoading } = useConversations();
  const { data: activeChannels = [] } = useActiveChannels();
  const conversations = conversationsResult?.data || [];
  console.log('Conversations loaded:', conversationsResult);

  // Crear mapa de canales por ID para acceso rápido
  const channelsMap = useMemo(() => {
    const map: Record<string, { id: string; name: string; type: string }> = {};
    activeChannels.forEach((ch: any) => {
      map[ch.id] = { id: ch.id, name: ch.name, type: ch.type };
    });
    return map;
  }, [activeChannels]);

  // Obtener conteo por canal (usando channel_id de las conversaciones)
  const conversationsByStatus = useMemo(() => {
    if (filter === 'all') {
      return conversations;
    }
    return conversations.filter((conv: any) => conv.status === filter);
  }, [conversations, filter]);

  const channelStats = useMemo(() => {
    const stats: Record<string, number> = { all: conversationsByStatus.length };
    conversationsByStatus.forEach((conv: any) => {
      const channelId = conv.channel_id;
      if (channelId) {
        stats[channelId] = (stats[channelId] || 0) + 1;
      }
    });
    return stats;
  }, [conversationsByStatus]);

  const conversationsByChannel = useMemo(() => {
    if (channelFilter === 'all') {
      return conversations;
    }
    return conversations.filter((conv: any) => conv.channel_id === channelFilter);
  }, [conversations, channelFilter]);

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

    if (channelFilter !== 'all') {
      filtered = filtered.filter((conv: any) => conv.channel_id === channelFilter);
    }

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      if (sortBy === 'unread_first') {
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
      all: conversationsByChannel.length,
      open: conversationsByChannel.filter((c: any) => c.status === 'open').length,
      pending: conversationsByChannel.filter((c: any) => c.status === 'pending').length,
      resolved: conversationsByChannel.filter(
        (c: any) => c.status === 'resolved' || c.status === 'closed'
      ).length,
      snoozed: conversationsByChannel.filter((c: any) => c.status === 'snoozed').length,
    };
  }, [conversationsByChannel]);

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
        setSortBy={(sort) => setSortBy(sort as SortType)}
        onCreateConversation={() => setShowCreateDialog(true)}
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
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col pb-2">
            {isLoading ? (
              <div className="p-12 text-center animate-in fade-in duration-500">
                <div className="relative w-12 h-12 mx-auto mb-4">
                  <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Cargando conversaciones...
                </p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-16 h-16 bg-muted/50 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-inner">
                  <MessageCircle className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  No hay chats
                </h4>
                <p className="text-xs text-muted-foreground px-4">
                  {filter !== 'all' || channelFilter !== 'all'
                    ? 'Prueba ajustando los filtros de búsqueda'
                    : 'Tus conversaciones de todos los canales aparecerán aquí'}
                </p>
                {(filter !== 'all' || channelFilter !== 'all') && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setFilter('all');
                      setChannelFilter('all');
                    }}
                    className="mt-2 text-xs h-auto p-0"
                  >
                    Restablecer filtros
                  </Button>
                )}
              </div>
            ) : (
              filteredConversations.map((conv: any) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  channelsMap={channelsMap}
                  isSelected={selectedConversationId === conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  onDeleted={() => {
                    if (selectedConversationId === conv.id) {
                      onSelectConversation('');
                    }
                  }}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <CreateConversationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={(conversationId) => {
          onSelectConversation(conversationId);
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
}
