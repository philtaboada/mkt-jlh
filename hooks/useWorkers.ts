import { getWorkers, Worker } from "@/lib/api/worker";
import { useQuery } from "@tanstack/react-query";

export const useWorkers = () => {
  return useQuery({
    queryKey: ["workers"],
    queryFn: getWorkers,
    staleTime: 60 * 24 * 60 * 60 * 1000, //60days
  });
};
