'use client';

import HeaderDetail from '@/components/shared/HeaderDetail';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FilterProspect, GetProspectsParams } from './FilterProspect';
import { useGetProspects } from '../hooks/useProspect';
import ProspectTable from './ProspectTable';

export function ProspectPageClient() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<GetProspectsParams>({});
  const { data, isLoading, refetch } = useGetProspects(filters);

  useEffect(() => {
    const workers = searchParams.get('workers')?.split(',') || [];
    const statuscode = searchParams.get('statuscode')?.split(',').map(Number) || [];
    const typeproduct = searchParams.get('typeproduct')?.split(',') || [];
    const search = searchParams.get('search') || '';
    const start_date = searchParams.get('start_date') || undefined;
    const end_date = searchParams.get('end_date') || undefined;

    const newFilters = {
      workers,
      statuscode,
      typeproduct,
      search,
      start_date,
      end_date,
    };

    // Solo setear si cambió
    setFilters((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(newFilters)) {
        return newFilters;
      }
      return prev;
    });
  }, [searchParams]);
  const prospects = data?.data || [];
  const pagination = {
    pageIndex: (data?.pagination?.pageIndex ?? 1) > 0 ? (data?.pagination?.pageIndex ?? 1) - 1 : 0,
    pageSize: data?.pagination?.pageSize ?? 10,
    total: data?.pagination?.total ?? 0,
    totalPages: data?.pagination?.totalPages ?? 0,
  };

  const onPageChange = (pageIndex: number, pageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      pageIndex,
      pageSize,
    }));
  };

  const onSearch = () => {
    // Implement search logic here marketing123
  };

  const onView = (prospect: any) => {
    // Implement view logic here
  };
  return (
    <div>
      <HeaderDetail
        title="Prospectos"
        subtitle="Gestiona tus prospectos de manera efectiva en el panel."
        className="rounded-lg shadow p-2 bg-primary/5"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <FilterProspect onFiltersChange={setFilters} />
          </div>
        }
      />
      <div className="mt-4">
        <ProspectTable
          prospects={prospects}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={onPageChange}
          onSearch={onSearch}
          onView={onView}
        />
      </div>
    </div>
  );
}
