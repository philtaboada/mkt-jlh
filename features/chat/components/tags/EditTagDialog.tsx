'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const colorOptions = [
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#6366F1',
  '#84CC16',
  '#F97316',
  '#14B8A6',
  '#A855F7',
  '#0EA5E9',
  '#F43F5E',
  '#22C55E',
  '#6B7280',
];

interface EditTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: { id: string; name: string; color: string };
  onTagChange: (tag: { id: string; name: string; color: string }) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function EditTagDialog({
  open,
  onOpenChange,
  tag,
  onTagChange,
  onSubmit,
  isLoading,
}: EditTagDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar etiqueta</DialogTitle>
          <DialogDescription>Modifica el nombre o color de la etiqueta.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre</Label>
            <Input
              id="edit-name"
              placeholder="Nombre de la etiqueta"
              value={tag.name}
              onChange={(e) => onTagChange({ ...tag, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    tag.color === color ? 'ring-2 ring-offset-2 ring-ring' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onTagChange({ ...tag, color })}
                />
              ))}
            </div>
          </div>
          <div className="pt-2">
            <Label>Vista previa</Label>
            <div className="mt-2">
              <Badge style={{ backgroundColor: tag.color }} className="text-white px-3 py-1">
                {tag.name || 'Etiqueta'}
              </Badge>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={!tag.name.trim() || isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
