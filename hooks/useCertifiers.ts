import { Certifier, getCertifiers } from "@/lib/api/certifier";
import { useQuery } from "@tanstack/react-query";


export const useCertifiers = () => {
  return useQuery({
    queryKey: ["certifiers"],
    queryFn: getCertifiers,
    staleTime: 60 * 24 * 60 * 60 * 1000, //60days
  });
};
