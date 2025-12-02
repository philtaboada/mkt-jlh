import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addAgentToTeam,
  removeAgentFromTeam,
} from '../api/teams.api';
import type { CreateTeamInput, UpdateTeamInput } from '../types/settings';

export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  });
};

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: ['team', id],
    queryFn: () => getTeamById(id),
    enabled: !!id,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTeamInput) => createTeam(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Equipo creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear equipo: ' + error.message);
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTeamInput }) => updateTeam(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      toast.success('Equipo actualizado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar equipo: ' + error.message);
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Equipo eliminado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar equipo: ' + error.message);
    },
  });
};

export const useAddAgentToTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, agentId }: { teamId: string; agentId: string }) =>
      addAgentToTeam(teamId, agentId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      toast.success('Agente añadido al equipo');
    },
    onError: (error) => {
      toast.error('Error al añadir agente: ' + error.message);
    },
  });
};

export const useRemoveAgentFromTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, agentId }: { teamId: string; agentId: string }) =>
      removeAgentFromTeam(teamId, agentId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      toast.success('Agente removido del equipo');
    },
    onError: (error) => {
      toast.error('Error al remover agente: ' + error.message);
    },
  });
};
