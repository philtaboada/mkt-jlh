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
} from '@/features/leads/api/leads';
import { LeadsFilters, Lead } from '@/features/leads/types/leads';
import { LeadStatus } from '../types/leadEnums';
import { getCompanyByDocument } from '@/features/companies/api/companies';
import { getPartnershipByDocument } from '@/features/partnerships/api/partnerships';
import { fetchRucData } from '@/lib/api/ruc';
import { LeadEntityTypeEnum, LeadEntityType } from '@/features/leads/types/leadEnums';
import { getDocumentSearchWithData } from '@/lib/api/documentSearch';
import { toast } from 'sonner';

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
    mutationFn: ({
      id,
      status,
      assigned_to,
    }: {
      id: string;
      status: LeadStatus;
      assigned_to?: string;
    }) => updateLeadStatus(id, status, assigned_to),
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



export const useUpdateLeadEntityData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ruc,
      type_entity,
    }: {
      id: string;
      ruc: string;
      type_entity: LeadEntityType;
    }) => {
      let extraData: any = {};
      const docData = await getDocumentSearchWithData(ruc, type_entity);
      if (docData) {
        extraData.business_or_person_name = docData.legal_name ?? null;
        extraData.business_or_partnership_id = docData.id ?? null;
        extraData.type_entity = type_entity;
        if (docData.worker_id !== null && docData.worker_id !== undefined) {
          extraData.assigned_to = docData.worker_id;
        }
      }
      return updateLead(id, {
        business_or_person_name: extraData.business_or_person_name ?? null,
        business_or_partnership_id: extraData.business_or_partnership_id ?? null,
        ...(extraData.assigned_to !== undefined ? { assigned_to: extraData.assigned_to } : {}),
        ruc,
        type_entity,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads_mkt'] });
      queryClient.invalidateQueries({ queryKey: ['leads_mkt', data.id] });
      toast.success('Empresa o consorcio actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(
        error?.message || 'Ocurrió un error al actualizar los datos de la empresa o consorcio'
      );
    }
  });
};