import { useQuery } from '@tanstack/react-query';
import { getCertifiers } from '../api/certifiers';

export const useCertifiers = () => {
  return useQuery({
    queryKey: ['certifiers'],
    queryFn: getCertifiers,
    staleTime: 60 * 60 * 1000, // 1 hora
  });
};
