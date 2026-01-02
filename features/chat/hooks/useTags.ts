import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getTags, createTag, updateTag, deleteTag } from '../api/tag.api';

export const useTags = (enabled = true) => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
    enabled,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, color }: { name: string; color?: string }) => createTag(name, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear tag: ' + error.message);
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateTag(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag actualizado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar tag: ' + error.message);
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag eliminado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar tag: ' + error.message);
    },
  });
};
