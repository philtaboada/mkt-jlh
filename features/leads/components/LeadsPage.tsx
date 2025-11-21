'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Download, Upload, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import HeaderDetail from '@/components/shared/HeaderDetail';
import { EntityDialog } from '@/components/shared/dialogs/EntityDialog';
import {
  useLeadsStats,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useUpdateLeadStatus,
  useLeads,
  useBulkImportFacebookLeads,
} from '@/features/leads/hooks/useLeads';
import { LeadForm } from '@/features/leads/components/LeadForm';
import {
  useCreateProspectGuaranteeLetter,
  useCreateProspectInsurance,
  useCreateProspectIso,
  useCreateProspectTrust,
} from '@/features/prospects/hooks/useProspect';
import { ImportModal } from '@/components/shared/ImportModal';
import { LeadFormInput } from '../schemas/leadSchemas';
import { LeadProductTypeEnum, LeadSource, LeadStatus } from '../types/leadEnums';
import LeadsFilters from './LeadsFilters';
import LeadsTable from './LeadsTable';
import { LeadsStatsCards } from './LeadsStatsCards';

export function LeadsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<LeadFormInput & { id: string }> | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Derive filters from search params
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const assignedTo = searchParams.get('assigned_to') || '';
  const statusParam = searchParams.get('status');
  const source = searchParams.get('source') as LeadSource | undefined;
  const status = statusParam as LeadStatus | undefined;
  const filters = { page, limit, search, status, assigned_to: assignedTo, source };

  // Hooks para datos
  const { data: leadsData, isLoading: leadsLoading, error } = useLeads(filters);

  // Mutations
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const deleteLeadMutation = useDeleteLead();
  const updateStatusMutation = useUpdateLeadStatus();
  const createIsoProspectMutation = useCreateProspectIso();
  const createTrustProspectMutation = useCreateProspectTrust();
  const createGuaranteeLetterProspectMutation = useCreateProspectGuaranteeLetter();
  const createInsuranceProspectMutation = useCreateProspectInsurance();
  const bulkImportMutation = useBulkImportFacebookLeads();
  const onSendToDeals = async (type: string, payload: any) => {
    try {
      if (type === LeadProductTypeEnum.ISOS) {
        await createIsoProspectMutation.mutateAsync(payload);
      } else if (type === LeadProductTypeEnum.FIDEICOMISOS) {
        await createTrustProspectMutation.mutateAsync(payload);
      } else if (type === LeadProductTypeEnum.CARTA_FIANZA) {
        await createGuaranteeLetterProspectMutation.mutateAsync(payload);
      } else if (type === LeadProductTypeEnum.SEGUROS) {
        await createInsuranceProspectMutation.mutateAsync(payload);
      }

      if (payload?.mkt_lead_id) {
        await updateStatusMutation.mutateAsync({
          id: payload.mkt_lead_id,
          status: 'deals',
        });
        toast.success('Prospecto creado y lead movido a Deals exitosamente');
      } else {
        toast.success('Prospecto creado exitosamente');
      }
    } catch (error) {
      toast.error('Error al crear el prospecto');
      throw error;
    }
  };

  // Estadísticas
  const { data: stats, isLoading: statsLoading } = useLeadsStats();
  const handleExport = () => {
    // TODO: Implementar exportación a CSV/Excel
    toast.info('Funcionalidad de exportación próximamente');
  };

  const handleImport = () => {
    setImportModalOpen(true);
  };

  const handleFileImport = async (
    data: any[]
  ): Promise<{ inserted: number; duplicates: number; errors: any[] }> => {
    try {
      const result = await bulkImportMutation.mutateAsync(data);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleFilterChange = (newFilters: any) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    params.set('page', '1'); // Reset to page 1 on filter change
    router.push(`?${params.toString()}`);
  };

  const handleCreate = async (data: LeadFormInput) => {
    await createLeadMutation.mutateAsync(data as any);
  };

  const handleUpdate = async (id: string, data: Partial<LeadFormInput>) => {
    await updateLeadMutation.mutateAsync({ id, updates: data as any });
  };

  const handleDelete = async (id: string) => {
    await deleteLeadMutation.mutateAsync(id);
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatusMutation.mutateAsync({ id, status: status as any });
  };

  const pagination = leadsData?.pagination
    ? { ...leadsData.pagination }
    : {
        pageIndex: 0,
        pageSize: 20,
        total: 0,
        totalPages: 0,
      };

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', (newPageIndex + 1).toString());
    params.set('limit', newPageSize.toString());
    router.push(`?${params.toString()}`);
  };

  const isSubmitting =
    createLeadMutation.isPending ||
    updateLeadMutation.isPending ||
    deleteLeadMutation.isPending ||
    updateStatusMutation.isPending;

  const onDelete = async (id: string) => {
    try {
      await handleDelete(id);
      toast.success('Lead eliminado exitosamente');
    } catch (err) {
      toast.error('Ocurrió un error al eliminar el lead');
    }
  };

  const onEdit = (lead: any) => {
    setEditing(lead);
    setDialogOpen(true);
  };

  if (error) {
    return (
      <div className="text-red-600">
        Error: {error instanceof Error ? error.message : 'Error al cargar leads'}
      </div>
    );
  }

  return (
    <div>
      <HeaderDetail
        title="Leads"
        subtitle="Gestiona y da seguimiento a todos tus prospectos"
        className="rounded-lg shadow p-2 bg-primary/5"
        actions={
          <>
            <LeadsFilters filters={filters} onFilterChange={handleFilterChange} />

            <Button
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
              disabled={isSubmitting}
              type="button"
              className="cursor-pointer"
            >
              <Plus />
              Nuevo
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" disabled={leadsLoading}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImport}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
        actionsClassName="space-x-2"
      />

      {/* Estadísticas rápidas debajo del header (datos pasados como props) */}
      <LeadsStatsCards stats={stats} isLoading={statsLoading} />

      <EntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Editar Lead' : 'Nuevo Lead'}
        description={editing ? 'Edita la información del lead' : 'Agrega un nuevo lead al sistema'}
        maxWidth="2xl"
        content={(onClose) => (
          <LeadForm
            defaultValues={editing as LeadFormInput}
            onSubmit={async (data) => {
              if (editing) {
                await handleUpdate(editing.id!, data);
              } else {
                await handleCreate(data);
              }
              setEditing(null);
              onClose();
            }}
            onCancel={() => {
              setEditing(null);
              onClose();
            }}
          />
        )}
      />
      <LeadsTable
        leads={leadsData?.data || []}
        isLoading={leadsLoading}
        urlSearchKey="search"
        pagination={pagination}
        onPageChange={handlePageChange}
        onDelete={onDelete}
        onEdit={onEdit}
        onStatusChange={handleStatusChange}
        onSendToDeals={onSendToDeals}
      />
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleFileImport}
        title="Importar Leads"
        description="Importa leads desde un archivo CSV o Excel. Asegúrate de que el archivo tenga las columnas correctas."
      />
    </div>
  );
}
