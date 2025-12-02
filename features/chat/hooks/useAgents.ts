import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAgents,
  getAgentById,
  getAgentByUserId,
  createAgent,
  updateAgent,
  deleteAgent,
  updateAgentStatus,
  getOnlineAgents,
  getAgentsByChannel,
} from '../api/agents.api';
import type { CreateAgentInput, UpdateAgentInput } from '../types/settings';

export const useAgents = () => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: getAgents,
  });
};

export const useAgent = (id: string) => {
  return useQuery({
    queryKey: ['agent', id],
    queryFn: () => getAgentById(id),
    enabled: !!id,
  });
};

export const useAgentByUserId = (userId: string) => {
  return useQuery({
    queryKey: ['agent', 'user', userId],
    queryFn: () => getAgentByUserId(userId),
    enabled: !!userId,
  });
};

export const useOnlineAgents = () => {
  return useQuery({
    queryKey: ['agents', 'online'],
    queryFn: getOnlineAgents,
  });
};

export const useAgentsByChannel = (channelId: string) => {
  return useQuery({
    queryKey: ['agents', 'channel', channelId],
    queryFn: () => getAgentsByChannel(channelId),
    enabled: !!channelId,
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAgentInput) => createAgent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast.success('Agente creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear agente: ' + error.message);
    },
  });
};

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAgentInput }) => updateAgent(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      toast.success('Agente actualizado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar agente: ' + error.message);
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast.success('Agente eliminado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar agente: ' + error.message);
    },
  });
};

export const useUpdateAgentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'online' | 'offline' | 'busy' }) =>
      updateAgentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast.success('Estado actualizado');
    },
    onError: (error) => {
      toast.error('Error al actualizar estado: ' + error.message);
    },
  });
};
