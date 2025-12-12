'use client';

import type React from 'react';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { contactNoteSchema } from '../../schemas/contactNoteSchema';
import { useCreateContactNote } from '../../hooks/useContacts';
import { useUser } from '@/features/auth/hooks/useAuth';
import { StickyNote } from 'lucide-react';
import type { z } from 'zod';

type ContactNoteFormData = z.infer<typeof contactNoteSchema>;

interface AddNoteDialogProps {
  contactId: string;
  onNoteAdded: () => void;
}

export function AddNoteDialog({ contactId, onNoteAdded }: AddNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const createNoteMutation = useCreateContactNote();
  const { data: user } = useUser();

  const form = useForm<ContactNoteFormData>({
    resolver: zodResolver(contactNoteSchema),
    defaultValues: {
      contact_id: contactId,
      note: '',
    },
  });

  const onSubmit = (data: ContactNoteFormData) => {
    createNoteMutation.mutate(
      {
        contactId,
        note: data.note,
        authorId: user?.id, // Use authenticated user ID, or undefined if not available
      },
      {
        onSuccess: () => {
          form.reset();
          setOpen(false);
          onNoteAdded();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full text-xs bg-transparent">
          <StickyNote className="w-3 h-3 mr-1" />
          Agregar Nota
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nota Interna</DialogTitle>
          <DialogDescription>
            Escribe una nota sobre este contacto (solo visible para tu equipo)
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe tu nota aquí..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={createNoteMutation.isPending}>
                {createNoteMutation.isPending ? 'Guardando...' : 'Guardar Nota'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
