'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserCircle, ArrowLeft, Plus, MoreVertical, Trash2, Edit2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useTeams, useCreateTeam, useDeleteTeam } from '@/features/chat/hooks';
import type { Team } from '@/features/chat/types/settings';

export function TeamsView() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '', auto_assign: true });

  const { data: teams = [], isLoading } = useTeams();
  const createTeamMutation = useCreateTeam();
  const deleteTeamMutation = useDeleteTeam();

  const handleCreateTeam = () => {
    if (!newTeam.name.trim()) return;

    createTeamMutation.mutate(
      { name: newTeam.name, description: newTeam.description, auto_assign: newTeam.auto_assign },
      {
        onSuccess: () => {
          setCreateDialogOpen(false);
          setNewTeam({ name: '', description: '', auto_assign: true });
        },
      }
    );
  };

  const handleDeleteTeam = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este equipo?')) {
      deleteTeamMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <TeamsHeader
        createDialogOpen={createDialogOpen}
        setCreateDialogOpen={setCreateDialogOpen}
        newTeam={newTeam}
        setNewTeam={setNewTeam}
        onCreateTeam={handleCreateTeam}
        isCreating={createTeamMutation.isPending}
      />

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Cargando equipos...</div>
          ) : teams.length === 0 ? (
            <TeamsEmptyState onCreateClick={() => setCreateDialogOpen(true)} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {teams.map((team: Team) => (
                <TeamCard key={team.id} team={team} onDelete={handleDeleteTeam} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TeamsHeaderProps {
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  newTeam: { name: string; description: string; auto_assign: boolean };
  setNewTeam: (team: { name: string; description: string; auto_assign: boolean }) => void;
  onCreateTeam: () => void;
  isCreating: boolean;
}

function TeamsHeader({
  createDialogOpen,
  setCreateDialogOpen,
  newTeam,
  setNewTeam,
  onCreateTeam,
  isCreating,
}: TeamsHeaderProps) {
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
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Equipos</h1>
              <p className="text-sm text-muted-foreground">Organiza tus agentes en equipos</p>
            </div>
          </div>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Equipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear nuevo equipo</DialogTitle>
              <DialogDescription>
                Los equipos permiten organizar y asignar conversaciones a grupos de agentes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre del equipo</Label>
                <Input
                  placeholder="Ej: Soporte Técnico"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción (opcional)</Label>
                <Textarea
                  placeholder="Describe las responsabilidades de este equipo..."
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Asignación automática</Label>
                  <p className="text-xs text-muted-foreground">
                    Asignar conversaciones automáticamente a este equipo
                  </p>
                </div>
                <Switch
                  checked={newTeam.auto_assign}
                  onCheckedChange={(checked) => setNewTeam({ ...newTeam, auto_assign: checked })}
                />
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
                  onClick={onCreateTeam}
                  disabled={!newTeam.name.trim() || isCreating}
                >
                  {isCreating ? 'Creando...' : 'Crear Equipo'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function TeamsEmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <Card className="bg-card">
      <CardContent className="py-12 text-center">
        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No hay equipos</h3>
        <p className="text-muted-foreground mb-4">
          Crea equipos para organizar a tus agentes y asignar conversaciones
        </p>
        <Button onClick={onCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Equipo
        </Button>
      </CardContent>
    </Card>
  );
}

interface TeamCardProps {
  team: Team;
  onDelete: (id: string) => void;
}

function TeamCard({ team, onDelete }: TeamCardProps) {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{team.name}</CardTitle>
            {team.description && (
              <CardDescription className="text-sm mt-1">{team.description}</CardDescription>
            )}
          </div>
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
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(team.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{team.agent_ids?.length || 0} agentes</span>
          </div>
          {team.auto_assign && (
            <Badge variant="secondary" className="text-xs">
              Auto-asignación
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
