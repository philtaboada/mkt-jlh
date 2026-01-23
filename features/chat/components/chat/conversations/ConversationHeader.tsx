'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Search, SlidersHorizontal, Check, Plus } from 'lucide-react';

interface ConversationHeaderProps {
  totalUnread: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'newest' | 'oldest' | 'unread_first';
  setSortBy: (sort: 'newest' | 'oldest' | 'unread_first') => void;
  onCreateConversation?: () => void;
}

export function ConversationHeader({
  totalUnread,
  searchQuery,
  onSearchChange,
  sortBy,
  setSortBy,
  onCreateConversation,
}: ConversationHeaderProps) {
  return (
    <div className="p-4 border-b border-border bg-background/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Chats</h1>
          {totalUnread > 0 && (
            <Badge className="h-5 min-w-5 px-1.5 text-[10px] bg-primary font-black rounded-full flex items-center justify-center">
              {totalUnread}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onCreateConversation && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onCreateConversation}
              className="h-9 w-9 rounded-xl hover:bg-muted transition-colors"
            >
              <Plus className="h-4.5 w-4.5 text-muted-foreground" />
            </Button>
          )}
          {/* Ordenar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-xl hover:bg-muted transition-colors"
              >
                <SlidersHorizontal className="h-4.5 w-4.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 p-1 rounded-xl shadow-xl border-border/50"
            >
              <DropdownMenuItem
                onClick={() => setSortBy('newest')}
                className="rounded-lg py-2 cursor-pointer"
              >
                Más recientes
                {sortBy === 'newest' && <Check className="ml-auto w-4 h-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy('oldest')}
                className="rounded-lg py-2 cursor-pointer"
              >
                Más antiguos
                {sortBy === 'oldest' && <Check className="ml-auto w-4 h-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onClick={() => setSortBy('unread_first')}
                className="rounded-lg py-2 cursor-pointer"
              >
                No leídos primero
                {sortBy === 'unread_first' && <Check className="ml-auto w-4 h-4 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <Input
          placeholder="Buscar chats..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:border-primary/30 rounded-xl transition-all"
        />
      </div>
    </div>
  );
}
