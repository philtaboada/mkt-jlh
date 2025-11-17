'use client';

import { toast } from 'sonner';
import { createSortableColumn, createActionsColumn } from '@/lib/utils/tableColumns';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Partnerships } from '@/types/database';
import { Checkbox } from '@/components/ui/checkbox';
import { PaginationData } from '@/lib/types/common';
import { DataTable } from '../shared/DataTable';

type Partnership = Partnerships;

interface PartnershipsTableProps {
  partnerships: Partnership[];
  isLoading?: boolean;
  pagination: PaginationData;
  onPageChange?: (pageIndex: number, pageSize: number) => void;
  onEdit?: (partnership: Partnership) => void;
  onDelete?: (id: string) => void;
  urlSearchKey?: string;
  onSearch?: () => void;
}

export default function PartnershipsTable({
  partnerships,
  isLoading = false,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  urlSearchKey,
  onSearch,
}: PartnershipsTableProps) {
  const copyEmail = (email?: string | null) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    toast.success('Email copiado al portapapeles');
  };

  const columns: ColumnDef<Partnership>[] = [
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
    createSortableColumn('name', 'Nombre', (value) => (
      <div className="font-medium">{value}</div>
    )) as ColumnDef<Partnership>,
    createSortableColumn('document', 'Documento', (value) => (
      <div className="text-sm text-muted-foreground">{value || '-'}</div>
    )) as ColumnDef<Partnership>,
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => {
        const email = row.getValue('email') as string | null;
        return (
          <div className="flex items-center gap-2">
            <div className="truncate text-sm text-muted-foreground">{email || '-'}</div>
            {email && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0"
                onClick={() => copyEmail(email)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    } as ColumnDef<Partnership>,
    createSortableColumn('mobile_number', 'N° Celular', (value) => (
      <div className="text-sm">{value || '-'}</div>
    )) as ColumnDef<Partnership>,
    createActionsColumn<Partnership>([
      {
        label: 'Editar',
        onClick: (partnership) => onEdit?.(partnership),
      },
      {
        label: 'Ver',
        onClick: () => toast('Ver detalles (no implementado)'),
      },
      {
        label: 'Copiar email',
        onClick: (partnership) => copyEmail(partnership.email),
        separator: true,
      },
    ]) as ColumnDef<Partnership>,
  ];

  return (
    <div>
      <DataTable
        data={partnerships}
        loading={isLoading}
        columns={columns}
        pagination={pagination}
        onPageChange={onPageChange}
        urlSearchKey={urlSearchKey}
        searchPlaceholder="Buscar consorcios..."
        emptyMessage="No se encontraron consorcios."
        onSearch={onSearch}
      />
    </div>
  );
}
