'use client';

import { createSortableColumn, createActionsColumn } from '@/lib/utils/tableColumns';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { PaginationData } from '@/lib/types/common';
import { DataTable } from '@/components/shared/DataTable';

export type Company = {
  id: string;
  legal_name: string;
  document?: string | null;
  email?: string | null;
  mobile_number?: string | null;
  worker_id?: string | null;
  worker?: { id: string; name: string } | null;
  workers?: { id: string; name: string } | null;
};

interface CompaniesTableProps {
  companies: Company[];
  isLoading?: boolean;
  pagination: PaginationData;
  onPageChange?: (pageIndex: number, pageSize: number) => void;
  onEdit?: (company: Company) => void;
  controlledSearch?: {
    value: string;
    onChange: (v: string) => void;
  };
  onSearch?: () => void;
}

export default function CompaniesTable({
  companies,
  isLoading = false,
  pagination,
  onPageChange,
  onEdit,
  controlledSearch,
  onSearch,
}: CompaniesTableProps) {
  const columns: ColumnDef<Company>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
    createSortableColumn('legal_name', 'Razon Social/Nombre', (value) => (
      <div className="font-medium">{value}</div>
    )) as ColumnDef<Company>,
    createSortableColumn('document', 'Documento') as ColumnDef<Company>,
    createSortableColumn('email', 'Email') as ColumnDef<Company>,
    createSortableColumn('mobile_number', 'Teléfono') as ColumnDef<Company>,
    {
      id: 'worker',
      header: 'Encargado',
      cell: ({ row }) => {
        const company = row.original;
        let w = company.worker ?? company.workers;
        if (Array.isArray(w)) w = w[0] ?? null;
        const name = w?.name ?? (typeof w === 'string' ? w : undefined);
        return name ? (
          <Badge>{name}</Badge>
        ) : (
          <span className="text-muted-foreground">Sin asignar</span>
        );
      },
    } as ColumnDef<Company>,
    createActionsColumn<Company>([
      {
        label: 'Editar',
        onClick: (company) => onEdit?.(company),
      },
      {
        label: 'Eliminar',
        onClick: () => {}, // TODO: Implement delete
        variant: 'destructive',
      },
    ]) as ColumnDef<Company>,
  ];

  return (
    <div className="w-full">
      <DataTable
        data={companies}
        pagination={pagination}
        onPageChange={onPageChange}
        columns={columns}
        searchPlaceholder="Buscar empresas..."
        showSearch={true}
        controlledSearch={controlledSearch}
        onSearch={onSearch}
        emptyMessage="No se encontraron empresas."
        loading={isLoading}
      />
    </div>
  );
}
