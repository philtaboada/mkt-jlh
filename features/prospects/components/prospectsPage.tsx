'use client';

import { useState } from 'react';
import HeaderDetail from '@/components/shared/HeaderDetail';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { EntityDialog } from '@/components/shared/dialogs/EntityDialog';
import { ProspectEditWorker } from './ProspectEditWorker';
import { ProspectView } from './ProspectView';

import { useSearchParams, useRouter } from 'next/navigation';
import { FilterProspect } from './FilterProspect';
import { useGetProspects } from '../hooks/useProspect';
import { useUpdateProspectWorker } from '../hooks/useUpdateProspectWorker';
import ProspectTable from './ProspectTable';
import { Prospect } from '../types/prospects';
import { UpdateProspectWorkerData } from '../types/updateWorker';

export function ProspectPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isEditWorkerDialogOpen, setIsEditWorkerDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { updateWorker } = useUpdateProspectWorker();

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

  const onView = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setIsViewDialogOpen(true);
  };

  const onChangeWorker = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setIsEditWorkerDialogOpen(true);
  };

  const handleWorkerUpdate = async (data: UpdateProspectWorkerData) => {
    if (!selectedProspect) return;

    try {
      await updateWorker(data);
      setIsEditWorkerDialogOpen(false);
      setSelectedProspect(null);
    } catch (error) {}
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
          onChangeWorker={onChangeWorker}
        />
      </div>

      <EntityDialog
        title="Cambiar Personal"
        description="Selecciona un nuevo personal para este prospecto"
        open={isEditWorkerDialogOpen}
        onOpenChange={setIsEditWorkerDialogOpen}
        maxWidth="sm"
        content={(onClose) =>
          selectedProspect ? (
            <ProspectEditWorker
              prospect={selectedProspect}
              onSubmit={(workerId) => {
                const sanitizedWorkerId = {
                  ...workerId,
                  insurance_type:
                    workerId.insurance_type === null ? undefined : workerId.insurance_type,
                };
                handleWorkerUpdate(sanitizedWorkerId);
                onClose();
              }}
              onCancel={onClose}
            />
          ) : null
        }
      />

      <EntityDialog
        title={`Vista del Prospecto: ${selectedProspect?.business_or_person_name || 'Sin nombre'}`}
        description="Información detallada del prospecto"
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        maxWidth="4xl"
        content={(onClose) =>
          selectedProspect ? <ProspectView prospect={selectedProspect} /> : null
        }
      />
    </div>
  );
}
