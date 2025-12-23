'use client';

import { toast } from 'sonner';
import { createSortableColumn, createActionsColumn } from '@/lib/utils/tableColumns';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { PaginationData } from '@/lib/types/common';
import { Prospect, ProspectProducts } from '@/features/prospects/types/prospects';
import { formatDate, formatDateTime } from '@/lib/utils/covertDate';
import { Badge } from '@/components/ui/badge';
import { getSeaceDataTypeLabel } from '@/lib/constants/seaceConstants';
import { getInitials, productColors } from '@/lib/utils/leadUtils';
import { DataTable } from '@/components/shared/DataTable';
import { LeadEntityTypeLabels, LeadProductTypeLabels } from '@/features/leads/types/leadLabels';
import { LeadProductTypeEnum } from '@/features/leads/types/leadEnums';

interface ProspectTableProps {
  prospects: Prospect[];
  isLoading?: boolean;
  pagination: PaginationData;
  onPageChange?: (pageIndex: number, pageSize: number) => void;
  onSearch?: () => void;
  onView?: (prospect: Prospect) => void;
  onChangeWorker?: (prospect: Prospect) => void;
  urlSearchKey?: string;
}

export default function ProspectTable({
  prospects,
  isLoading = false,
  pagination,
  onPageChange,
  onSearch,
  urlSearchKey,
  onView,
  onChangeWorker,
}: ProspectTableProps) {
  const copyName = (name?: string | null) => {
    if (!name) return;
    navigator.clipboard.writeText(name);
    toast.success('Nombre copiado al portapapeles');
  };

  const columns: ColumnDef<Prospect>[] = [
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
    createSortableColumn('management_date', 'F. de Gestión', (value) => (
      <div className="text-sm">{value ? formatDate(value) : '-'}</div>
    )) as ColumnDef<Prospect>,
    {
      id: 'business_or_person_name',
      header: 'Razón Social / Nombre',
      accessorKey: 'business_or_person_name',
      cell: ({ row }) => {
        const name = row.original.business_or_person_name || '-';
        const typeEntity = row.original.type_entity as
          | keyof typeof LeadEntityTypeLabels
          | undefined;
        const typeLabel = typeEntity ? LeadEntityTypeLabels[typeEntity] : undefined;
        return (
          <div className="flex flex-col gap-1 line-clamp-1 max-w-sm" title={name}>
            <span className="font-medium">{name}</span>
            {typeLabel && <span className="text-xs text-muted-foreground">{typeLabel}</span>}
          </div>
        );
      },
    } as ColumnDef<Prospect>,
    createSortableColumn('worker', 'Personal Asignado', (worker) => {
      if (!worker) {
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-semibold">
              ?
            </div>
            <span className="text-muted-foreground text-sm">Sin asignar</span>
          </div>
        );
      }
      const initials = getInitials(
        worker.name.split(' ')[0],
        worker.name.split(' ').slice(1).join(' ')
      );
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
            {initials}
          </div>
          <div>
            <div className="font-medium text-sm">{worker.name}</div>
          </div>
        </div>
      );
    }) as ColumnDef<Prospect>,
    {
      id: 'products_type',
      header: 'Tipo de Producto',
      cell: ({ row }) => {
        const value = row.original.products as ProspectProducts[];
        if (!value || value.length === 0) return <div className="text-sm">-</div>;
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((prod) => {
              if (!prod) return null;
              return (
                <Badge
                  key={prod.id}
                  variant="default"
                  className={`text-xs font-semibold text-white ${productColors[prod.type] || 'bg-gray-500'}`}
                >
                  {prod.type === LeadProductTypeEnum.SEGUROS
                    ? prod.insurance_type ||
                      LeadProductTypeLabels[prod.type as keyof typeof LeadProductTypeLabels] ||
                      prod.type
                    : LeadProductTypeLabels[prod.type as keyof typeof LeadProductTypeLabels] ||
                      prod.type}
                </Badge>
              );
            })}
          </div>
        );
      },
    } as ColumnDef<Prospect>,
    {
      id: 'products_status',
      header: 'Gestión de Estado',
      cell: ({ row }) => {
        const value = row.original.products as ProspectProducts[];
        if (!value || value.length === 0) return <div className="text-sm">-</div>;
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((prod) => {
              if (!prod) return null;
              return (
                <Badge
                  key={prod.id}
                  variant="secondary"
                  className={`text-xs font-semibold text-white ${productColors[prod.type] || 'bg-linear-to-r from-gray-500 to-slate-600 text-white shadow-sm'}`}
                >
                  {getSeaceDataTypeLabel(prod.status_code) || prod.status_code}
                </Badge>
              );
            })}
          </div>
        );
      },
    } as ColumnDef<Prospect>,

    {
      id: 'product_date_passed',
      header: 'F. de Ult. Gestión',
      cell: ({ row }) => {
        const value = row.original.products as ProspectProducts[];
        if (!value || value.length === 0) return <div className="text-sm">-</div>;
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((prod) => {
              if (!prod) return null;
              const datePassed = prod.date_passed;
              let bgColor = 'bg-gray-500'; // default
              if (datePassed && datePassed !== '-') {
                const days = parseInt(datePassed.split(' ')[0], 10);
                if (days === 0) bgColor = 'bg-green-500';
                else if (days === 2) bgColor = 'bg-orange-500';
                else if (days >= 3) bgColor = 'bg-red-500';
              }
              return (
                <Badge
                  key={prod.id}
                  variant="secondary"
                  className={`text-xs font-semibold text-white ${bgColor} shadow-sm`}
                >
                  {prod.type === LeadProductTypeEnum.SEGUROS
                    ? prod.insurance_type ||
                      LeadProductTypeLabels[prod.type as keyof typeof LeadProductTypeLabels] ||
                      prod.type
                    : LeadProductTypeLabels[prod.type as keyof typeof LeadProductTypeLabels] ||
                      prod.type}
                  : {prod.date_passed ?? '-'}
                </Badge>
              );
            })}
          </div>
        );
      },
    },
    {
      id: 'products_update',
      header: 'Última actualización',
      cell: ({ row }) => {
        const value = row.original.products as ProspectProducts[];
        if (!value || value.length === 0) return <div className="text-sm">-</div>;
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((prod) => {
              if (!prod) return null;
              return (
                <Badge
                  key={prod.id}
                  variant="secondary"
                  className={`text-xs font-semibold text-white ${productColors[prod.type] || 'bg-linear-to-r from-gray-500 to-slate-600 text-white shadow-sm'}`}
                >
                  {prod.update_date_passed ? formatDateTime(prod.update_date_passed) : '-'}
                </Badge>
              );
            })}
          </div>
        );
      },
    } as ColumnDef<Prospect>,
    createActionsColumn<Prospect>([
      {
        label: 'Ver',
        onClick: (prospect) => onView?.(prospect),
      },
      {
        label: 'Cambiar de personal',
        onClick: (prospect) => onChangeWorker?.(prospect),
      },
      {
        label: 'Copiar nombre',
        onClick: (prospect) => copyName(prospect.business_or_person_name),
        separator: true,
      },
    ]) as ColumnDef<Prospect>,
  ];

  return (
    <div>
      <DataTable
        data={prospects}
        loading={isLoading}
        columns={columns}
        pagination={pagination}
        onPageChange={onPageChange}
        urlSearchKey={urlSearchKey}
        searchPlaceholder="Buscar prospectos..."
        showSearch={true}
        searchColumn="business_or_person_name"
        emptyMessage="No se encontraron prospectos."
        onSearch={onSearch}
      />
    </div>
  );
}
