'use client';

import ConversationsTable from '@/features/chat/components/ConversationsTable';
import { useConversations } from '@/features/chat/hooks/useConversations';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MessageSquare, Download, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ConversationsPage() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: result, isLoading, refetch } = useConversations(pageIndex, pageSize);
  const router = useRouter();

  const conversations = result?.data || [];
  const pagination = result?.pagination;

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleView = (conversation: any) => {
    router.push(`/chat/inbox?conversation=${conversation.id}`);
  };

  const handleAssign = (id: string, assignedTo: string) => {
    console.log('Assign', id, assignedTo);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Todas las conversaciones</h1>
              <p className="text-sm text-muted-foreground">
                Gestiona y visualiza todas las conversaciones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Buscar por nombre o mensaje..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-muted">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="open">Abiertos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="resolved">Resueltos</SelectItem>
              <SelectItem value="closed">Cerrados</SelectItem>
            </SelectContent>
          </Select>

          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-40 bg-muted">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los canales</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="web">Web</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-card rounded-lg border border-border">
          <ConversationsTable
            conversations={conversations}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onView={handleView}
            onAssign={handleAssign}
          />
        </div>
      </div>
    </div>
  );
}
