'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag as TagIcon, Search, Plus, MoreVertical, Pencil, Trash2, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/features/chat/hooks/useTags';
import { CreateTagDialog } from './CreateTagDialog';
import { EditTagDialog } from './EditTagDialog';

export function TagsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);
  const [editTag, setEditTag] = useState({ id: '', name: '', color: '#3B82F6' });

  const { data: tags = [], isLoading } = useTags();
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  const filteredTags = tags.filter((tag) =>
    tag.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTag = (name: string, color: string) => {
    createTagMutation.mutate(
      { name, color },
      {
        onSuccess: () => setIsDialogOpen(false),
      }
    );
  };

  const handleUpdateTag = () => {
    if (!editTag.name.trim()) return;

    updateTagMutation.mutate(
      { id: editTag.id, updates: { name: editTag.name, color: editTag.color } },
      {
        onSuccess: () => {
          setEditTag({ id: '', name: '', color: '#3B82F6' });
          setIsEditDialogOpen(false);
        },
      }
    );
  };

  const handleDeleteTag = () => {
    if (!deleteTagId) return;

    deleteTagMutation.mutate(deleteTagId, {
      onSuccess: () => setDeleteTagId(null),
    });
  };

  const openEditDialog = (tag: { id: string; name: string; color?: string | null }) => {
    setEditTag({ id: tag.id, name: tag.name || '', color: tag.color || '#3B82F6' });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <TagsHeader tagsCount={tags.length} onCreateClick={() => setIsDialogOpen(true)} />

      {/* Search */}
      <div className="bg-card border-b border-border px-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar etiquetas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted"
            />
          </div>
        </div>
      </div>

      {/* Tags Grid */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {isLoading ? (
            <TagsGridSkeleton />
          ) : filteredTags.length === 0 ? (
            <TagsEmptyState searchQuery={searchQuery} onCreateClick={() => setIsDialogOpen(true)} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTags.map((tag) => (
                <TagCard
                  key={tag.id}
                  tag={tag}
                  onEdit={() =>
                    tag.id && openEditDialog({ id: tag.id, name: tag.name || '', color: tag.color })
                  }
                  onDelete={() => tag.id && setDeleteTagId(tag.id)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Create Dialog */}
      <CreateTagDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateTag}
        isLoading={createTagMutation.isPending}
      />

      {/* Edit Dialog */}
      <EditTagDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        tag={editTag}
        onTagChange={setEditTag}
        onSubmit={handleUpdateTag}
        isLoading={updateTagMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTagId} onOpenChange={() => setDeleteTagId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar etiqueta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La etiqueta será eliminada permanentemente y se
              removerá de todos los contactos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTag}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteTagMutation.isPending}
            >
              {deleteTagMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TagsHeader({
  tagsCount,
  onCreateClick,
}: {
  tagsCount: number;
  onCreateClick: () => void;
}) {
  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TagIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Etiquetas</h1>
            <p className="text-sm text-muted-foreground">{tagsCount} etiquetas creadas</p>
          </div>
        </div>
        <Button size="sm" onClick={onCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva etiqueta
        </Button>
      </div>
    </div>
  );
}

interface TagCardProps {
  tag: { id?: string; name?: string | null; color?: string | null; created_at?: string | null };
  onEdit: () => void;
  onDelete: () => void;
}

function TagCard({ tag, onEdit, onDelete }: TagCardProps) {
  return (
    <Card className="border-border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: (tag.color || '#3B82F6') + '20' }}
          >
            <TagIcon className="w-5 h-5" style={{ color: tag.color || '#3B82F6' }} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-2">
          <Badge
            style={{ backgroundColor: tag.color || '#3B82F6' }}
            className="text-white text-sm px-3 py-1"
          >
            {tag.name}
          </Badge>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
          <Users className="w-3 h-3" />
          <span>
            Creado{' '}
            {tag.created_at
              ? new Date(tag.created_at).toLocaleDateString('es-ES')
              : 'recientemente'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function TagsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded" />
            </div>
            <Skeleton className="h-6 w-20 mb-3" />
            <Skeleton className="h-4 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TagsEmptyState({
  searchQuery,
  onCreateClick,
}: {
  searchQuery: string;
  onCreateClick: () => void;
}) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
        <TagIcon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">No hay etiquetas</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {searchQuery
          ? 'No se encontraron etiquetas con esa búsqueda'
          : 'Crea tu primera etiqueta para organizar contactos'}
      </p>
      {!searchQuery && (
        <Button onClick={onCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Crear etiqueta
        </Button>
      )}
    </div>
  );
}
