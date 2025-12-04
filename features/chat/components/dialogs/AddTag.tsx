'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTags, useAddTagToContact } from '../../hooks';
import { Tag } from 'lucide-react';

interface AddTagDialogProps {
  contactId: string;
  currentTags: any[];
  onTagAdded: () => void;
}

export function AddTagDialog({ contactId, currentTags, onTagAdded }: AddTagDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: allTags = [], isLoading } = useTags();
  const addTagMutation = useAddTagToContact();

  const availableTags = allTags.filter((tag) => !currentTags.find((ct) => ct.tag_id === tag.id));

  const handleAddTag = (tagId: string) => {
    addTagMutation.mutate(
      { contactId, tagId },
      {
        onSuccess: () => {
          setOpen(false);
          onTagAdded();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full text-xs bg-transparent">
          <Tag className="w-3 h-3 mr-1" />
          Agregar Etiqueta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Etiqueta</DialogTitle>
          <DialogDescription>Selecciona una etiqueta para agregar al contacto</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando etiquetas...</p>
          ) : availableTags.length > 0 ? (
            availableTags
              .filter((tag) => tag.id) // Filter out tags without id
              .map((tag) => (
                <Button
                  key={tag.id}
                  onClick={() => handleAddTag(tag.id!)}
                  disabled={addTagMutation.isPending}
                  className="w-full text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </Button>
              ))
          ) : (
            <p className="text-sm text-muted-foreground">Todas las etiquetas ya están agregadas</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
