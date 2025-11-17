import { useQuery } from '@tanstack/react-query';
import { getRucInfo, getDniInfo } from '@/lib/api/apisRuc';
import { checkDocumentExists } from '@/lib/api/companies';
import { checkPartnershipDocumentExists } from '@/lib/api/partnerships';

interface DocumentSearchResult {
  data: {
    legal_name?: string;
    address?: {
      address_detail?: string;
      district?: string;
      province?: string;
      department?: string;
      country?: string;
    };
  } | null;
  existsInDb: boolean;
}

export function useDocumentSearch(
  document: string,
  documentType: string,
  enabled: boolean = false,
  trigger?: number,
  entity: 'company' | 'partnership' = 'company'
) {
  return useQuery({
    queryKey: ['document-search', document, documentType, trigger, entity],
    queryFn: async (): Promise<DocumentSearchResult> => {
      // First check if exists in db
      const existsInDb =
        entity === 'partnership'
          ? await checkPartnershipDocumentExists(document)
          : await checkDocumentExists(document, documentType);

      if (existsInDb) {
        return { data: null, existsInDb: true };
      }

      // If not in db, search in SUNAT
      let sunatData;
      if (documentType === 'RUC') {
        sunatData = await getRucInfo(document);
      } else if (documentType === 'DNI') {
        sunatData = await getDniInfo(document);
      }

      if (!sunatData) {
        return { data: null, existsInDb: false };
      }

      // Format SUNAT data
      const formattedData = {
        legal_name: sunatData.nombre || sunatData.razonSocial || '',
        address: {
          address_detail: sunatData.direccion || sunatData.direccionCompleta || '',
          district: sunatData.distrito || '',
          province: sunatData.provincia || '',
          department: sunatData.departamento || '',
          country: 'Perú',
        },
      };

      return { data: formattedData, existsInDb: false };
    },
    enabled: enabled && !!document && !!documentType,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
