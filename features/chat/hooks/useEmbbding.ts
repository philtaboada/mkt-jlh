import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { processDocument, getKnowledgeBaseStats } from '@/features/chat/api/embbeding';

/**
 * Hook para procesar documentos y generar embeddings
 */
export function useProcessDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      for (const file of files) {
        if (file.type !== 'text/markdown') {
          throw new Error(`Tipo de archivo no soportado: ${file.type}`);
        }
        const text = await file.text();
        await processDocument(text, file.name);
      }

      return { message: 'Embeddings procesados exitosamente' };
    },
    onSuccess: () => {
      toast.success('Embeddings procesados exitosamente');
      // Invalidar la query de estadísticas para recargarlas
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-stats'] });
    },
    onError: (error: Error) => {
      toast.error('Error procesando embeddings: ' + error.message);
    },
  });
}

/**
 * Hook para obtener estadísticas de la base de conocimientos
 */
export function useKnowledgeBaseStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ['knowledge-base-stats'],
    queryFn: getKnowledgeBaseStats,
    enabled,
  });
}
