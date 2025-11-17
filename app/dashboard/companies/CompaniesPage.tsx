'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import HeaderDetail from '@/components/shared/HeaderDetail';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CompaniesTable from '@/components/companies/CompaniesTable';
import { useCreateCompany, useUpdateCompany, useCompanies } from '@/lib/hooks/useCompanies';
import { EntityDialog } from '@/components/shared/dialogs/EntityDialog';
import { CompanyInput } from '@/lib/schemas/companySchema';
import { CompanyForm } from '@/components/companies/CompanyForm';
import { toast } from 'sonner';

export function CompaniesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<any>(null);

  // Derive filters from search params
  const pageIndex = parseInt(searchParams.get('page') || '1') - 1;
  const pageSize = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';

  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();

  // Pass pagination to useCompanies
  const { data: companies, isLoading } = useCompanies({
    pageIndex,
    pageSize,
    search,
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
        await createMutation.mutateAsync(data);
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
  const onPageChange = (newPageIndex: number, newPageSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', (newPageIndex + 1).toString());
    params.set('limit', newPageSize.toString());
    router.push(`?${params.toString()}`);
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
          onPageChange={onPageChange}
          onEdit={handleEdit}
          urlSearchKey="search"
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
