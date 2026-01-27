import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTemplatesByChannel, syncTemplatesForChannel } from '../api/template.api';
import { toast } from 'sonner';

export function useTemplates(channelId: string | undefined, provider?: string) {
  return useQuery({
    queryKey: ['templates', channelId, provider],
    queryFn: () => {
      if (!channelId) throw new Error('Channel ID is required');
      return getTemplatesByChannel(channelId, provider);
    },
    enabled: !!channelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function syncWhatsappTemplates(channelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncTemplatesForChannel,
    onSuccess: () => {
      toast.success('Sincronización exitosa');
      queryClient.invalidateQueries({ queryKey: ['templates', channelId] });
    },
  });
}
