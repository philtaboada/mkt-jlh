import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { createClient } from '../supabase/client';

const supabase = createClient();
interface Worker {
  id: string;
  name: string;
  email: string;
}
const fetchWorkers = async (): Promise<Worker[]> => {
  try {
    const { data, error } = await supabase.from('workers').select('id, name, email');

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const useWorkers = (): UseQueryResult<Worker[], Error> => {
  return useQuery<Worker[], Error>({
    queryKey: ['workers'],
    queryFn: fetchWorkers,
    staleTime: 60 * 60 * 1000, // 1 hora
  });
};
