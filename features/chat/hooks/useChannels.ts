import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getChannels,
  getChannelById,
  getChannelsByType,
  createChannel,
  updateChannel,
  deleteChannel,
  regenerateWidgetToken,
} from '../api/channels.api';
import type { CreateChannelInput, UpdateChannelInput } from '../types/settings';

export const useChannels = () => {
  return useQuery({
    queryKey: ['channels'],
    queryFn: getChannels,
  });
};

export const useChannel = (id: string) => {
  return useQuery({
    queryKey: ['channel', id],
    queryFn: () => getChannelById(id),
    enabled: !!id,
  });
};

export const useChannelsByType = (type: string) => {
  return useQuery({
    queryKey: ['channels', 'type', type],
    queryFn: () => getChannelsByType(type),
    enabled: !!type,
  });
};

export const useCreateChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateChannelInput) => createChannel(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Canal creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear canal: ' + error.message);
    },
  });
};

export const useUpdateChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateChannelInput }) =>
      updateChannel(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['channel', id] });
      toast.success('Canal actualizado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar canal: ' + error.message);
    },
  });
};

export const useDeleteChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteChannel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Canal eliminado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar canal: ' + error.message);
    },
  });
};

export const useRegenerateWidgetToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => regenerateWidgetToken(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['channel', id] });
      toast.success('Token regenerado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al regenerar token: ' + error.message);
    },
  });
};
