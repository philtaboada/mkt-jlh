'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { UIEvent as ReactUIEvent } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  useConversationCounts,
  useConversations,
  useTotalUnread,
} from '@/features/chat/hooks/useConversations';
import { useActiveChannels } from '@/features/chat/hooks/useChannels';

import { ConversationHeader } from './ConversationHeader';
import { ConversationFilters } from './ConversationFilters';
import { ConversationItem } from './ConversationItem';
import { CreateConversationDialog } from './CreateConversationDialog';
import { useChatStore } from '@/features/chat/stores/chat.store';

type Channel = {
  id: string;
  name: string;
  type: string;
};

export function ConversationList() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    filters,
    setFilters,
    setActiveChannels,
    activeChannels: storeActiveChannels,
    activeConversationId,
    setActiveConversationId,
  } = useChatStore();

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConversations(20);

  const { data: activeChannels = [] } = useActiveChannels();
  const { data: conversationCounts } = useConversationCounts();
  const { data: totalUnread } = useTotalUnread();

  const conversations = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  useEffect(() => {
    const storeIds = storeActiveChannels.map((c) => c.id).join(',');
    const apiIds = activeChannels.map((c) => c.id).join(',');

    if (storeIds !== apiIds) {
      setActiveChannels(activeChannels);
    }
  }, [activeChannels, storeActiveChannels, setActiveChannels]);

  const handleScroll = useCallback(
    (event: ReactUIEvent<HTMLDivElement>) => {
      const el = event.currentTarget as HTMLElement;

      if (
        el.scrollHeight - el.scrollTop - el.clientHeight < 200 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const mappedConversationCounts = useMemo(() => {
    if (!conversationCounts) {
      return { all: 0, open: 0, pending: 0, resolved: 0, snoozed: 0 };
    }

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

  const channelsMap = useMemo<Record<string, Channel>>(
    () => Object.fromEntries(activeChannels.map((ch) => [ch.id, ch])),
    [activeChannels]
  );

  if (error) {
    return <div className="w-80 p-4 text-sm text-destructive">Error cargando conversaciones</div>;
  }

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      <ConversationHeader
        totalUnread={totalUnread || 0}
        sortBy={filters.sortBy}
        setSortBy={(sortBy) => setFilters({ sortBy })}
        onCreateConversation={() => setShowCreateDialog(true)}
        searchQuery={filters.searchQuery || ''}
        onSearchChange={(searchQuery) => setFilters({ searchQuery })}
      />

      <ConversationFilters
        activeChannels={activeChannels}
        channelFilter={filters.channel}
        setChannelFilter={(channel) => setFilters({ channel })}
        filter={filters.status}
        setFilter={(status) => setFilters({ status })}
        conversationCounts={mappedConversationCounts}
      />

      <div className="px-4 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground">{conversations.length} conversaciones</span>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="flex flex-col pb-2" onScroll={handleScroll}>
            {isLoading ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                Cargando conversaciones...
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
                {conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    channelsMap={channelsMap}
                    isSelected={activeConversationId === conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      router.push(`/chat/inbox/${conv.id}`);
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
          router.push(`/chat/inbox/${id}`);
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
}
