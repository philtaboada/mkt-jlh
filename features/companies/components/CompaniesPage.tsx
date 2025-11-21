'use client';

import * as React from 'react';
import HeaderDetail from '@/components/shared/HeaderDetail';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCreateCompany, useUpdateCompany, useCompanies } from '@/features/companies/hooks/useCompanies';
import { EntityDialog } from '@/components/shared/dialogs/EntityDialog';
import { CompanyInput } from '@/features/companies/schemas/companySchema';
import { CompanyForm } from '@/features/companies/components/CompanyForm';
import { toast } from 'sonner';
import CompaniesTable from './CompaniesTable';

export function CompaniesPageClient() {
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<any>(null);

  // Pagination state
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 3000);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when search changes
  React.useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch]);

  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();

  // Pass pagination to useCompanies
  const { data: companies, isLoading } = useCompanies({
    pageIndex,
    pageSize,
    search: debouncedSearch,
  });
  const handleShowChange = (open: boolean) => {
    setShowModal(open);
    if (!open) setEditing(null);
  };

  const handleSubmit = async (data: CompanyInput) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data });
        toast.success('Empresa actualizada exitosamente');
      } else {
        await createMutation.mutateAsync(data as any);
        toast.success('Empresa creada exitosamente');
      }
      setShowModal(false);
      setEditing(null);
    } catch (error: any) {
      toast.error(
        error?.message || 'Ocurrió un error al guardar la empresa. Por favor, inténtelo de nuevo.'
      );
    }
  };

  const handleEdit = (company: any) => {
    setEditing(company);
    setShowModal(true);
  };

  // Update pagination state on page change
  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const pagination = companies?.pagination
    ? { ...companies.pagination }
    : {
        pageIndex,
        pageSize,
        total: 0,
        totalPages: 0,
      };

  return (
    <div>
      <HeaderDetail
        title="Empresas"
        subtitle="Administra las empresas desde el panel de control."
        className="rounded-lg shadow p-2 bg-primary/5"
        actions={
          <>
            <Button className="cursor-pointer" onClick={() => setShowModal(true)}>
              <Plus />
              Nuevo
            </Button>
          </>
        }
      />

      <div className="mt-4">
        <CompaniesTable
          companies={companies?.data || []}
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          controlledSearch={{
            value: search,
            onChange: setSearch,
          }}
          onSearch={() => setDebouncedSearch(search)}
        />
      </div>

      <EntityDialog
        title={editing ? 'Editar Empresa' : 'Crear Empresa'}
        open={showModal}
        maxWidth="2xl"
        onOpenChange={handleShowChange}
        content={(onClose) => (
          <CompanyForm
            defaultValues={editing}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        )}
      />
    </div>
  );
}
