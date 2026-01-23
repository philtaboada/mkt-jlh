'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { useDeleteContact } from '@/features/chat/hooks/useContacts';
import { Contact } from '@/features/chat/types/contact';

interface DeleteContactDialogProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactDeleted?: () => void;
}

export function DeleteContactDialog({
  contact,
  open,
  onOpenChange,
  onContactDeleted,
}: DeleteContactDialogProps) {
  const deleteContactMutation = useDeleteContact();

  const handleDelete = () => {
    if (!contact) return;

    deleteContactMutation.mutate(contact.id, {
      onSuccess: () => {
        onOpenChange(false);
        onContactDeleted?.();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar contacto</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres eliminar el contacto "{contact?.name || 'Sin nombre'}"?
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteContactMutation.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteContactMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteContactMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
