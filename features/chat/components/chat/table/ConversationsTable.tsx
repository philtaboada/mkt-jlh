'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PaginationData } from '@/lib/types/common';
import { Conversation } from '@/features/chat/types';
import { DataTable } from '@/components/shared/DataTable';

interface ConversationsTableProps {
  conversations: Conversation[];
  isLoading?: boolean;
  pagination?: PaginationData;
  onPageChange?: (pageIndex: number, pageSize: number) => void;
  onView?: (conversation: Conversation) => void;
  onAssign?: (id: string, assignedTo: string) => void;
}

export default function ConversationsTable({
  conversations,
  isLoading,
  pagination,
  onPageChange,
  onView,
  onAssign,
}: ConversationsTableProps) {
  const columns: ColumnDef<Conversation>[] = [
    {
      accessorKey: 'contact.name',
      header: 'Contacto',
      cell: ({ row }) => {
        const contact = row.original.mkt_contacts;
        return (
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={contact?.avatar_url ?? undefined} />
              <AvatarFallback>{contact?.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{contact?.name || 'Sin nombre'}</div>
              <div className="text-sm text-muted-foreground">{contact?.wa_id}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'channel',
      header: 'Canal',
      cell: ({ row }) => <Badge variant="outline">{row.original.channel}</Badge>,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'open' ? 'default' : 'secondary'}>
          {row.original.status === 'open' ? 'Abierto' : 'Cerrado'}
        </Badge>
      ),
    },
    {
      accessorKey: 'last_message_at',
      header: 'Último mensaje',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.last_message_at
            ? new Date(row.original.last_message_at).toLocaleString()
            : 'Nunca'}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const conversation = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(conversation)}>
                Ver conversación
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (conversation.id) onAssign?.(conversation.id, 'me');
                }}
              >
                Asignar a mí
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={conversations}
      loading={isLoading}
      pagination={pagination}
      onPageChange={onPageChange}
    />
  );
}
