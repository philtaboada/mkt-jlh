'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useConversations } from '../hooks/useConversations';
import { Search, MessageSquare, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const channelIcons: Record<string, string> = {
  whatsapp: '📱',
  facebook: '👥',
  instagram: '📷',
  web: '🌐',
};

const statusColors: Record<string, string> = {
  open: 'bg-green-500',
  closed: 'bg-gray-500',
  pending: 'bg-yellow-500',
};

export function ConversationsList({
  onSelectConversation,
  selectedConversationId,
  searchQuery,
  onSearchChange,
}: ConversationsListProps) {
  const { data: conversationsResult, isLoading } = useConversations();
  const conversations = conversationsResult?.data || [];

  const filteredConversations = useMemo(() => {
    return conversations.filter(
      (conv: any) =>
        conv.mkt_contacts?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.channel?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, conversations]);

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">Conversaciones</h1>
            <p className="text-xs text-sidebar-foreground/60">Inbox</p>
          </div>
          <MessageSquare className="w-5 h-5 text-sidebar-primary" />
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sidebar-foreground/40" />
          <Input
            placeholder="Buscar conversación..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-sidebar-accent border-sidebar-accent-foreground/20 text-sidebar-foreground placeholder:text-sidebar-foreground/40"
          />
        </div>

        {/* Add Conversation Button */}
        <Button className="w-full" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Conversación
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {isLoading ? (
            <div className="py-8 text-center text-sidebar-foreground/60">
              <p className="text-sm">Cargando conversaciones...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-8 text-center text-sidebar-foreground/60">
              <p className="text-sm">No se encontraron conversaciones</p>
            </div>
          ) : (
            filteredConversations.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  'w-full p-3 rounded-lg text-left transition-all duration-200 group',
                  selectedConversationId === conv.id
                    ? 'bg-sidebar-primary/20 border border-sidebar-primary'
                    : 'hover:bg-sidebar-accent/50 border border-transparent'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0 mt-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={conv.mkt_contacts?.avatar_url}
                        alt={conv.mkt_contacts?.name || 'Contacto'}
                      />
                      <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white">
                        {conv.mkt_contacts?.name?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Channel Badge */}
                    <div
                      className={cn(
                        'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-sidebar text-white text-xs flex items-center justify-center',
                        conv.channel === 'whatsapp'
                          ? 'bg-green-500'
                          : conv.channel === 'facebook'
                            ? 'bg-blue-600'
                            : conv.channel === 'instagram'
                              ? 'bg-pink-500'
                              : 'bg-purple-500'
                      )}
                    >
                      {channelIcons[conv.channel] || '🌐'}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-sidebar-foreground truncate">
                        {conv.mkt_contacts?.name || 'Sin nombre'}
                      </h3>
                      {conv.unread_count && conv.unread_count > 0 && (
                        <Badge className="bg-sidebar-primary text-sidebar-primary-foreground text-xs px-2 py-0.5 shrink-0">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>

                    {/* Channel and Status */}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 capitalize">
                        {conv.channel}
                      </Badge>
                      <Badge
                        variant={conv.status === 'open' ? 'default' : 'secondary'}
                        className="text-xs px-2 py-0.5"
                      >
                        {conv.status === 'open' ? 'Activo' : 'Cerrado'}
                      </Badge>
                    </div>

                    {/* Last Message Preview */}
                    {conv.last_message && (
                      <p className="text-xs text-sidebar-foreground/60 truncate mt-1">
                        {conv.last_message.length > 50
                          ? `${conv.last_message.substring(0, 50)}...`
                          : conv.last_message}
                      </p>
                    )}

                    {/* Last Message Time */}
                    {conv.last_message_at && (
                      <p className="text-xs text-sidebar-foreground/40 mt-1">
                        {formatTime(new Date(conv.last_message_at))}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
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
  return `${diffDays}d`;
}
