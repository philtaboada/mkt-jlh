export interface UpdateProspectWorkerData {
  worker_id: string;
  observation?: string;
  id: string;
  main_product_id: string;
  entity_type: string;
  type: string;
  insurance_type?: string | null;
  product_id: string;
  status_code: number;
}
