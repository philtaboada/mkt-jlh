'use client';

import HeaderDetail from '@/components/shared/HeaderDetail';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

import { useSearchParams, useRouter } from 'next/navigation';
import { FilterProspect } from './FilterProspect';
import { useGetProspects } from '../hooks/useProspect';
import ProspectTable from './ProspectTable';

export function ProspectPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Derive filters from search params
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const workers = searchParams.get('workers')?.split(',') || [];
  const statuscode = searchParams.get('statuscode')?.split(',').map(Number) || [];
  const typeproduct = searchParams.get('typeproduct')?.split(',') || [];
  const search = searchParams.get('search') || '';
  const start_date = searchParams.get('start_date') || undefined;
  const end_date = searchParams.get('end_date') || undefined;

  const filters = {
    page_index: page,
    page_size: limit,
    workers,
    statuscode,
    typeproduct,
    search,
    start_date,
    end_date,
  };

  const { data, isLoading, refetch } = useGetProspects(filters);
  const prospects = data?.data || [];
  const pagination = data?.pagination
    ? { ...data.pagination }
    : {
        pageIndex: 0,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      };

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', (newPageIndex + 1).toString());
    params.set('limit', newPageSize.toString());
    router.push(`?${params.toString()}`);
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
            <FilterProspect />
          </div>
        }
      />
      <div className="mt-4">
        <ProspectTable
          prospects={prospects}
          isLoading={isLoading}
          urlSearchKey="search"
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={onSearch}
          onView={onView}
        />
      </div>
    </div>
  );
}
