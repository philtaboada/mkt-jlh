import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPartnerships,
  createPartnership,
  updatePartnership,
  searchPartnerships,
} from '../api/partnerships';

export function usePartnerships(filters: {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  sortBy?: { id: string; desc: boolean }[];
}) {
  return useQuery({
    queryKey: ['partnerships', filters],
    queryFn: () => getPartnerships(filters),
  });
}

export function useCreatePartnership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPartnership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerships'] });
    },
  });
}

export function useUpdatePartnership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updatePartnership(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerships'] });
    },
  });
}

export function useSearchPartnerships(term: string, enabled: boolean) {
  return useQuery({
    queryKey: ['searchPartnerships', term],
    queryFn: () => searchPartnerships(term),
    enabled: !!term && enabled,
    staleTime: 0,
    gcTime: 0,
  });
}
