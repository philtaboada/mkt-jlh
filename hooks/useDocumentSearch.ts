import { useQuery } from '@tanstack/react-query';
import {
  checkPartnershipDocumentExists,
  getPartnershipByDocument,
} from '@/features/partnerships/api/partnerships';
import { checkDocumentExists, getCompanyByDocument } from '@/features/companies/api/companies';
import { fetchDniData, fetchRucData } from '@/lib/api/ruc';
import { LeadEntityType, LeadEntityTypeEnum } from '@/features/leads/types/leadEnums';
import { getDocumentSearchWithData } from '@/lib/api/documentSearch';

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
      const existsInDb =
        entity === 'partnership'
          ? await checkPartnershipDocumentExists(document)
          : await checkDocumentExists(document, documentType);

      if (existsInDb) {
        return { data: null, existsInDb: true };
      }

      let sunatData;
      if (documentType === 'RUC') {
        sunatData = await fetchRucData(document);
      } else if (documentType === 'DNI') {
        sunatData = await fetchDniData(document);
      }

      if (!sunatData) {
        return { data: null, existsInDb: false };
      }

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

export function useDocumentSearchWithData(document: string, entity: LeadEntityType) {
  return useQuery({
    queryKey: ['document-search-with-data', document],
    queryFn: () => getDocumentSearchWithData(document, entity),
    enabled: !!document,
    staleTime: 1000 * 60 * 5,
  });
}
