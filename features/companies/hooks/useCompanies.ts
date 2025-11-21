
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCompany, deleteCompany, getCompanies, getCompanyById, searchCompanies, updateCompany } from '../api/companies';

interface CompanyFilters {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  sortBy?: { id: string; desc: boolean }[];
}

export function useCompanies(filters: CompanyFilters) {

  return useQuery({
    queryKey: ['companies', filters],
    queryFn: () => getCompanies(filters),
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      return updateCompany(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useDeleteCompany() {
  return useMutation({
    mutationFn: deleteCompany,
  });
}

export function useGetCompanyById(id: string) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => getCompanyById(id),
    enabled: !!id,
  });
}

export function useSearchCompanies(term: string, enabled: boolean) {
  return useQuery({
    queryKey: ['searchCompanies', term],
    queryFn: () => searchCompanies(term),
    enabled: !!term && enabled,
    staleTime: 0,
    gcTime: 0,
  });
}
