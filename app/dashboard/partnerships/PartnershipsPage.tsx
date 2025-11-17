'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import HeaderDetail from '@/components/shared/HeaderDetail';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PartnershipsTable from '@/components/partnerships/PartnershipsTable';
import { EntityDialog } from '@/components/shared/dialogs/EntityDialog';
import { PartnershipForm } from '@/components/partnerships/PartnershipForm';
import {
  useCreatePartnership,
  useUpdatePartnership,
  usePartnerships,
} from '@/lib/hooks/usePartnerships';
import { toast } from 'sonner';

export function PartnershipsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDialog, setShowDialog] = React.useState(false);
  const [editing, setEditing] = React.useState<any>(null);
  const createMutation = useCreatePartnership();
  const updateMutation = useUpdatePartnership();

  // Derive filters from search params
  const pageIndex = parseInt(searchParams.get('page') || '1') - 1;
  const pageSize = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';

  // Obtener data aquí en la página
  const { data: partnerships, isLoading } = usePartnerships({ pageIndex, pageSize, search });

  const handleDelete = async (id: string) => {
    // Implementar lógica de eliminación
    console.log('Delete partnership:', id);
  };

  // Actualizar paginación y recargar datos
  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', (newPageIndex + 1).toString());
    params.set('limit', newPageSize.toString());
    router.push(`?${params.toString()}`);
  };

  const pagination = partnerships?.pagination
    ? { ...partnerships.pagination }
    : {
        pageIndex,
        pageSize,
        total: 0,
        totalPages: 0,
      };

  const handleSubmit = async (data: any) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data });
        toast.success('Consorcio actualizado exitosamente');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Consorcio creado exitosamente');
      }
      setEditing(null);
      setShowDialog(false);
    } catch (error: any) {
      toast.error(
        error?.message || 'Ocurrió un error al guardar el consorcio. Por favor, inténtelo de nuevo.'
      );
    }
  };
  return (
    <div>
      <HeaderDetail
        title="Consorcios"
        subtitle="Administra tus consorcios desde el panel de control."
        className="rounded-lg shadow p-2 bg-primary/5"
        actions={
          <>
            <Button
              className="cursor-pointer"
              onClick={() => {
                setEditing(null);
                setShowDialog(true);
              }}
            >
              <Plus />
              Nuevo
            </Button>
          </>
        }
      />

      <div className="mt-6">
        <PartnershipsTable
          partnerships={partnerships?.data || []}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          urlSearchKey="search"
          onEdit={(partnership) => {
            setEditing(partnership);
            setShowDialog(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      <EntityDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title={editing ? 'Editar Consorcio' : 'Nuevo Consorcio'}
        description={editing ? 'Edita el consorcio' : 'Crea una nuevo consorcio'}
        maxWidth="2xl"
        content={(onClose) => (
          <PartnershipForm
            defaultValues={editing}
            onSubmit={handleSubmit}
            onCancel={() => {
              setEditing(null);
              setShowDialog(false);
            }}
          />
        )}
      />
    </div>
  );
}
