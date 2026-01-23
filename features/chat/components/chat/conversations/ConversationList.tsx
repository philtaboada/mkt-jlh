'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';

import {
  useConversationCounts,
  useConversations,
  useTotalUnread,
} from '@/features/chat/hooks/useConversations';
import { useActiveChannels } from '@/features/chat/hooks/useChannels';

import { ConversationHeader } from '@/features/chat/components/chat/conversations/ConversationHeader';
import { ConversationFilters } from '@/features/chat/components/chat/conversations/ConversationFilters';
import { ConversationItem } from '@/features/chat/components/chat/conversations/ConversationItem';
import { CreateConversationDialog } from '@/features/chat/components/chat/conversations/CreateConversationDialog';
import { useChatStore } from '@/features/chat/stores/chat.store';

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
}

export function ConversationList({ onSelectConversation }: ConversationListProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const {
    filters,
    setFilters,
    setActiveChannels,
    activeChannels: storeActiveChannels,
    activeConversationId,
    setActiveConversationId,
  } = useChatStore();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, error } =
    useConversations(20);

  const { data: activeChannels = [] } = useActiveChannels();
  const { data: conversationCounts } = useConversationCounts();
  const { data: totalUnread } = useTotalUnread();

  const conversations = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  const mappedConversationCounts = useMemo(() => {
    if (!conversationCounts) return { all: 0, open: 0, pending: 0, resolved: 0, snoozed: 0 };
    return {
      all:
        (conversationCounts.inbox || 0) +
        (conversationCounts.snoozed || 0) +
        (conversationCounts.archived || 0),
      open: conversationCounts.inbox || 0,
      pending: conversationCounts.unread || 0,
      resolved: conversationCounts.archived || 0,
      snoozed: conversationCounts.snoozed || 0,
    };
  }, [conversationCounts]);

  useEffect(() => {
    if (JSON.stringify(activeChannels) !== JSON.stringify(storeActiveChannels)) {
      setActiveChannels(activeChannels);
    }
  }, [activeChannels, storeActiveChannels, setActiveChannels]);

  const handleScroll = useCallback(
    (event: Event) => {
      const el = event.target as HTMLDivElement;
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;

      if (nearBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const root = scrollAreaRef.current;
    if (!root) return;

    const viewport = root.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;

    viewport.addEventListener('scroll', handleScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const channelsMap = useMemo(() => {
    return Object.fromEntries(
      activeChannels.map((ch: any) => [ch.id, { id: ch.id, name: ch.name, type: ch.type }])
    );
  }, [activeChannels]);

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <ConversationHeader
        totalUnread={totalUnread || 0}
        sortBy={filters.sortBy}
        setSortBy={(sortBy) => setFilters({ sortBy })}
        onCreateConversation={() => setShowCreateDialog(true)}
        searchQuery={filters.searchQuery || ''}
        onSearchChange={(searchQuery) => setFilters({ searchQuery })}
      />

      {/* Filters */}
      <ConversationFilters
        activeChannels={activeChannels}
        channelFilter={filters.channel}
        setChannelFilter={(channel) => setFilters({ channel })}
        filter={filters.status}
        setFilter={(status) => setFilters({ status })}
        conversationCounts={mappedConversationCounts}
      />

      {/* Result info */}
      <div className="px-4 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground">
          {conversations.length} conversaciones
          {hasNextPage && !isFetchingNextPage && (
            <span className="ml-1">(scroll para cargar más)</span>
          )}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="flex flex-col pb-2">
            {isLoading ? (
              <div className="p-12 text-center">
                <p className="text-sm text-muted-foreground">Cargando conversaciones...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-12 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No hay conversaciones</p>
                {(filters.status !== 'all' || filters.channel !== 'all') && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setFilters({ status: 'all', channel: 'all' })}
                  >
                    Restablecer filtros
                  </Button>
                )}
              </div>
            ) : (
              <>
                {conversations.map((conv: any) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    channelsMap={channelsMap}
                    isSelected={activeConversationId === conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      onSelectConversation(conv.id);
                    }}
                  />
                ))}

                {isFetchingNextPage && (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    Cargando más conversaciones...
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      <CreateConversationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={(id) => {
          setActiveConversationId(id);
          onSelectConversation(id);
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
}
