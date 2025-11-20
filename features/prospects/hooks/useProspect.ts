import {  useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProspectGuaranteeLetter,
  createProspectInsurance,
  createProspectIso,
  createProspectTrust,
  getProspects,
} from '../api/prospects';


export function useGetProspects(filter: any) {
  return useQuery({
    queryKey: ['prospects', filter],
    queryFn: () => getProspects(filter),
  });
}

export function useCreateProspectIso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProspectIso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
    },
  });
}

export function useCreateProspectTrust() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProspectTrust,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
    },
  });
}

export function useCreateProspectInsurance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProspectInsurance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
    },
  });
}

export function useCreateProspectGuaranteeLetter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProspectGuaranteeLetter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
    },
  });
}
