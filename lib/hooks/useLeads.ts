import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLeads,
  getLeadById,
  getLeadsStats,
  createLead,
  updateLead,
  updateLeadStatus,
  assignLead,
  updateLeadScore,
  deleteLead,
  bulkUpdateLeads,
  bulkInsertLeads,
  verifyProducts,
} from '@/lib/api/leads';
import { LeadsFilters, LeadStatus, Lead } from '@/types/lead';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============= QUERIES CON PAGINACIÓN Y FILTROS =============

export const useLeads = (filters: LeadsFilters = {}) => {
  return useQuery({
    queryKey: ['leads_mkt', filters],
    queryFn: () => getLeads(filters),
    staleTime: 30000, // 30 segundos
  });
};

// Verificar productos asociados a un lead
export const useVerifyProducts = (id?: string) => {
  return useQuery({
    queryKey: ['verify_products', id],
    queryFn: () => verifyProducts(id!),
    enabled: !!id,
    staleTime: 300000, // 5 minutos
  });
};

// Obtener lead por ID
export const useLead = (id: string) => {
  return useQuery({
    queryKey: ['leads_mkt', id],
    queryFn: () => getLeadById(id),
    enabled: !!id,
  });
};

// Obtener estadísticas de leads
export const useLeadsStats = () => {
  return useQuery({
    queryKey: ['leads_mkt', 'stats'],
    queryFn: getLeadsStats,
    staleTime: 60000, // 1 minuto
  });
};

// ============= MUTATIONS =============

// Crear nuevo lead
export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads_mkt'] });
    },
  });
};

// Actualizar lead
export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Lead> }) =>
      updateLead(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads_mkt'] });
      queryClient.invalidateQueries({ queryKey: ['leads_mkt', data.id] });
    },
  });
};

// Actualizar status del lead
export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      updateLeadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads_mkt'] });
    },
  });
};

// Asignar lead a usuario
export const useAssignLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string | null }) => assignLead(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads_mkt'] });
    },
  });
};

// Actualizar score del lead
export const useUpdateLeadScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, score }: { id: string; score: number }) => updateLeadScore(id, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads_mkt'] });
    },
  });
};

// Eliminar lead
export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads_mkt'] });
    },
  });
};

// Actualizar múltiples campos a la vez
export const useBulkUpdateLeads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: Partial<Lead> }) =>
      bulkUpdateLeads(ids, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads_mkt'] });
    },
  });
};

// Importar leads masivamente
export const useBulkImportFacebookLeads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leads: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'assigned_user'>[]) =>
      bulkInsertLeads(leads),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads_mkt'] });
      queryClient.invalidateQueries({ queryKey: ['leads_mkt', 'stats'] });
    },
  });
};

//Guardar Leads desde el hook de Facebook (uno por uno)
export const useSaveFacebookLeads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => createLead(lead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads_mkt'] });
      queryClient.invalidateQueries({ queryKey: ['leads_mkt', 'stats'] });
    },
  });
};
