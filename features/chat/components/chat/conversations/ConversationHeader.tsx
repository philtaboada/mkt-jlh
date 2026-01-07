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
import { Search, SlidersHorizontal } from 'lucide-react';

interface ConversationHeaderProps {
  totalUnread: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export function ConversationHeader({
  totalUnread,
  searchQuery,
  onSearchChange,
  sortBy,
  setSortBy,
}: ConversationHeaderProps) {
  return (
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
  );
}
