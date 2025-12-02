'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  ArrowLeft,
  Plus,
  MoreVertical,
  Trash2,
  Edit2,
  Circle,
  UserCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAgents,
  useCreateAgent,
  useDeleteAgent,
  useUpdateAgentStatus,
} from '@/features/chat/hooks';
import type { Agent, AgentRole, AgentStatus } from '@/features/chat/types/settings';
import { cn } from '@/lib/utils';

const roleLabels: Record<AgentRole, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  agent: 'Agente',
};

const roleColors: Record<AgentRole, string> = {
  admin: 'bg-purple-500/10 text-purple-600',
  supervisor: 'bg-blue-500/10 text-blue-600',
  agent: 'bg-muted text-muted-foreground',
};

const statusColors: Record<AgentStatus, string> = {
  online: 'text-emerald-500',
  offline: 'text-muted-foreground',
  busy: 'text-amber-500',
};

export function AgentsView() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', email: '', role: 'agent' as AgentRole });

  const { data: agents = [], isLoading } = useAgents();
  const createAgentMutation = useCreateAgent();
  const deleteAgentMutation = useDeleteAgent();
  const updateStatusMutation = useUpdateAgentStatus();

  const handleCreateAgent = () => {
    if (!newAgent.name.trim() || !newAgent.email.trim()) return;

    createAgentMutation.mutate(
      { name: newAgent.name, email: newAgent.email, role: newAgent.role },
      {
        onSuccess: () => {
          setCreateDialogOpen(false);
          setNewAgent({ name: '', email: '', role: 'agent' });
        },
      }
    );
  };

  const handleDeleteAgent = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este agente?')) {
      deleteAgentMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: string, status: AgentStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <AgentsHeader
        onCreateClick={() => setCreateDialogOpen(true)}
        createDialogOpen={createDialogOpen}
        setCreateDialogOpen={setCreateDialogOpen}
        newAgent={newAgent}
        setNewAgent={setNewAgent}
        onCreateAgent={handleCreateAgent}
        isCreating={createAgentMutation.isPending}
      />

      {/* Stats */}
      <AgentsStats agents={agents} />

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Cargando agentes...</div>
          ) : agents.length === 0 ? (
            <AgentsEmptyState onCreateClick={() => setCreateDialogOpen(true)} />
          ) : (
            <div className="space-y-3">
              {agents.map((agent: Agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteAgent}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AgentsHeaderProps {
  onCreateClick: () => void;
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  newAgent: { name: string; email: string; role: AgentRole };
  setNewAgent: (agent: { name: string; email: string; role: AgentRole }) => void;
  onCreateAgent: () => void;
  isCreating: boolean;
}

function AgentsHeader({
  createDialogOpen,
  setCreateDialogOpen,
  newAgent,
  setNewAgent,
  onCreateAgent,
  isCreating,
}: AgentsHeaderProps) {
  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/chat/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Agentes</h1>
              <p className="text-sm text-muted-foreground">Gestiona los agentes de tu equipo</p>
            </div>
          </div>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Agente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar nuevo agente</DialogTitle>
              <DialogDescription>
                Invita a un miembro de tu equipo para atender conversaciones
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  placeholder="Juan Pérez"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input
                  type="email"
                  placeholder="juan@empresa.com"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={newAgent.role}
                  onValueChange={(value: AgentRole) => setNewAgent({ ...newAgent, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agente</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={onCreateAgent}
                  disabled={!newAgent.name.trim() || !newAgent.email.trim() || isCreating}
                >
                  {isCreating ? 'Creando...' : 'Agregar Agente'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function AgentsStats({ agents }: { agents: Agent[] }) {
  return (
    <div className="bg-card border-b border-border px-6 py-3">
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
          <span className="text-muted-foreground">
            {agents.filter((a) => a.status === 'online').length} en línea
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-2 h-2 fill-amber-500 text-amber-500" />
          <span className="text-muted-foreground">
            {agents.filter((a) => a.status === 'busy').length} ocupados
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-2 h-2 fill-muted-foreground text-muted-foreground" />
          <span className="text-muted-foreground">
            {agents.filter((a) => a.status === 'offline').length} desconectados
          </span>
        </div>
      </div>
    </div>
  );
}

function AgentsEmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <Card className="bg-card">
      <CardContent className="py-12 text-center">
        <UserCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No hay agentes</h3>
        <p className="text-muted-foreground mb-4">
          Agrega agentes para que puedan atender las conversaciones
        </p>
        <Button onClick={onCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Agente
        </Button>
      </CardContent>
    </Card>
  );
}

interface AgentCardProps {
  agent: Agent;
  onStatusChange: (id: string, status: AgentStatus) => void;
  onDelete: (id: string) => void;
}

function AgentCard({ agent, onStatusChange, onDelete }: AgentCardProps) {
  return (
    <Card className="bg-card">
      <CardContent className="py-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={agent.avatar_url} />
              <AvatarFallback>
                {agent.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Circle
              className={cn(
                'w-3 h-3 absolute -bottom-0.5 -right-0.5 fill-current',
                statusColors[agent.status]
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground truncate">{agent.name}</h3>
              <Badge variant="secondary" className={cn('text-xs', roleColors[agent.role])}>
                {roleLabels[agent.role]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{agent.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={agent.status}
              onValueChange={(value: AgentStatus) => onStatusChange(agent.id, value)}
            >
              <SelectTrigger className="w-36 h-8 text-xs">
                <div className="flex items-center gap-2">
                  <Circle className={cn('w-2 h-2 fill-current', statusColors[agent.status])} />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">
                  <div className="flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                    En línea
                  </div>
                </SelectItem>
                <SelectItem value="busy">
                  <div className="flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-amber-500 text-amber-500" />
                    Ocupado
                  </div>
                </SelectItem>
                <SelectItem value="offline">
                  <div className="flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-muted-foreground text-muted-foreground" />
                    Desconectado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(agent.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
