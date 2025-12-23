'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateProductAndEntityFromJson } from '../api/prospects';

export function useUpdateProspectWorker() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateProductAndEntityFromJson,
    onSuccess: () => {
      toast.success('El personal se actualizó correctamente');
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
    },
    onError: (error) => {
      toast.error('Ocurrió un error al actualizar el personal');
    },
  });

  return {
    updateWorker: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
