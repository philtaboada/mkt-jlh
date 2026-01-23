import { useQuery } from '@tanstack/react-query';
import { getTemplatesByChannel } from '../api/template.api';

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
