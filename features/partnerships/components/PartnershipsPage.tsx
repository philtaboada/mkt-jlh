'use client';

import * as React from 'react';
import HeaderDetail from '@/components/shared/HeaderDetail';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EntityDialog } from '@/components/shared/dialogs/EntityDialog';
import {
  useCreatePartnership,
  useUpdatePartnership,
  usePartnerships,
} from '@/features/partnerships/hooks/usePartnerships';
import { toast } from 'sonner';
import { PartnershipForm } from './PartnershipForm';
import PartnershipsTable from './PartnershipsTable';

export function PartnershipsPageClient() {
  const [showDialog, setShowDialog] = React.useState(false);
  const [editing, setEditing] = React.useState<any>(null);
  const createMutation = useCreatePartnership();
  const updateMutation = useUpdatePartnership();
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [search, setSearch] = React.useState('');
  // Pagination state
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);

  // Obtener data aquí en la página
  const { data: partnerships, isLoading } = usePartnerships({ pageIndex, pageSize, search: debouncedSearch });

  const handleDelete = async (id: string) => {
    // Implementar lógica de eliminación
    console.log('Delete partnership:', id);
  };

  // Actualizar paginación y recargar datos
  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
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
          onSearch={() => setDebouncedSearch(search)}
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
