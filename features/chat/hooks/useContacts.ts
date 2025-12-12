import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  findOrCreateByWhatsApp,
  updateLastInteraction,
  getContactTags,
  addTagToContact,
  removeTagFromContact,
  getContactNotes,
  createContactNote,
  updateContactNote,
  deleteContactNote,
} from '../api/contact.api';
import { Contact } from '../types/contact';

export const useContacts = () => {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: getContacts,
  });
};

export const useContact = (id: string) => {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: () => getContactById(id),
    enabled: !!id,
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contact: Partial<Contact>) => createContact(contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contacto creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear contacto: ' + error.message);
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Contact> }) =>
      updateContact(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact', id] });
      toast.success('Contacto actualizado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar contacto: ' + error.message);
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contacto eliminado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar contacto: ' + error.message);
    },
  });
};

export const useContactTags = (contactId: string) => {
  return useQuery({
    queryKey: ['contact-tags', contactId],
    queryFn: () => getContactTags(contactId),
    enabled: !!contactId,
  });
};

export const useContactNotes = (contactId: string) => {
  return useQuery({
    queryKey: ['contact-notes', contactId],
    queryFn: () => getContactNotes(contactId),
    enabled: !!contactId,
  });
};

export const useCreateContactByWhatsApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ waId, name }: { waId: string; name: string }) =>
      findOrCreateByWhatsApp(waId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contacto creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear contacto: ' + error.message);
    },
  });
};

export const useUpdateLastInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => updateLastInteraction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

export const useAddTagToContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, tagId }: { contactId: string; tagId: string }) =>
      addTagToContact(contactId, tagId),
    onSuccess: (_, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: ['contact-tags', contactId] });
      toast.success('Tag agregado al contacto');
    },
    onError: (error) => {
      toast.error('Error al agregar tag: ' + error.message);
    },
  });
};

export const useRemoveTagFromContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, tagId }: { contactId: string; tagId: string }) =>
      removeTagFromContact(contactId, tagId),
    onSuccess: (_, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: ['contact-tags', contactId] });
      toast.success('Tag removido del contacto');
    },
    onError: (error) => {
      toast.error('Error al remover tag: ' + error.message);
    },
  });
};

export const useCreateContactNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contactId,
      note,
      authorId,
    }: {
      contactId: string;
      note: string;
      authorId?: string;
    }) => createContactNote(contactId, note, authorId),
    onSuccess: (_, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: ['contact-notes', contactId] });
      toast.success('Nota creada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear nota: ' + error.message);
    },
  });
};

export const useUpdateContactNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateContactNote(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-notes'] });
      toast.success('Nota actualizada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar nota: ' + error.message);
    },
  });
};

export const useDeleteContactNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteContactNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-notes'] });
      toast.success('Nota eliminada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar nota: ' + error.message);
    },
  });
};
