// Tipos comunes reutilizables
export interface DataResponse<T> {
  data: T[];
  pagination: PaginationData;
}

export interface Filters {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
}


export interface PaginationData {
  pageIndex: number;
  pageSize: number;
  total: number;
  totalPages: number;
}