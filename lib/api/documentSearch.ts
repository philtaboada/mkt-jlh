"use server";
import { getCompanyByDocument } from "@/features/companies/api/companies";
import { LeadEntityType, LeadEntityTypeEnum } from "@/features/leads/types/leadEnums";
import { getPartnershipByDocument } from "@/features/partnerships/api/partnerships";
import { fetchRucData } from "./ruc";

interface DocumentSearchWithDataResult {
    id: string|null; //Id de la empresa o partnership si existe
  document: string;
  legal_name: string;
  worker_id?: string | null;
  existsInDb: boolean;
}

// Utilidad para obtener datos de documento
export const getDocumentSearchWithData = async (
  document: string,
  entity: LeadEntityType
): Promise<DocumentSearchWithDataResult> => {
  const existsInDb =
    entity === LeadEntityTypeEnum.PARTNERSHIPS
      ? await getPartnershipByDocument(document)
      : await getCompanyByDocument(document);

  if (existsInDb) {
    return { ...existsInDb, existsInDb: true };
  }

  let sunatData;
  if (document.length === 11) {
    sunatData = await fetchRucData(document);
  }

  if (!sunatData) {
    return { existsInDb: false, document, legal_name: '', id: null };
  }

  return {
    id: null,
    document,
    legal_name: sunatData.nombre || sunatData.razonSocial || '',
    worker_id: null,
    existsInDb: false,
  };
};
