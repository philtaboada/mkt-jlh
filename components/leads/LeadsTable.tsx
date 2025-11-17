'use client';

import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import {
  createSortableColumn,
  createBadgeColumn,
  createAvatarColumn,
  createProgressColumn,
  createCurrencyColumn,
  createDateColumn,
} from '@/lib/utils/tableColumns';
import { getLeadStatusLabel, getLeadSourceLabel } from '@/lib/schemas/leadSchemas';
import { LeadEntityTypeLabels, getPlatformLabel } from '@/lib/constants/leadConstants';
import type { Lead as BaseLead } from '@/types/lead';
import { ColumnDef } from '@tanstack/react-table';
import { PaginationData } from '@/lib/types/common';
import { DataTable } from '../shared/DataTable';
import { SendToDealsModal } from '../prospects/SendToDealsModal';
import { useState } from 'react';
import { LeadProductType } from '@/lib/enums/leadEnums';
import { sourceColors, statusColors, platformColors } from '@/lib/utils/leadUtils';
import { getInitials } from '@/lib/utils/leadUtils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import * as React from 'react';

type Lead = BaseLead;

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  pagination?: PaginationData;
  onPageChange?: (pageIndex: number, pageSize: number) => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  onSendToDeals?: (type: LeadProductType, payload: any) => Promise<void>;
  urlSearchKey?: string;
  onSearch?: () => void;
}

export default function LeadsTable({
  leads,
  isLoading = false,
  onEdit,
  onDelete,
  onStatusChange,
  onSendToDeals,
  urlSearchKey,
  pagination,
  onPageChange,
  onSearch,
}: LeadsTableProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDealsModalOpen, setIsDealsModalOpen] = useState(false);
  const [type, setType] = useState<'add' | 'new'>('new');
  const handleSendToDeals = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDealsModalOpen(true);
  };

  const handleDealsSubmit = async (dealData: any) => {
    if (selectedLead && onSendToDeals) {
      await onSendToDeals(dealData.type, dealData.payload);
      toast.success('Lead enviado a deals exitosamente');
    }
  };
  const copyEmailToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success('Email copiado al portapapeles');
  };

  const columns: ColumnDef<Lead>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    } as ColumnDef<Lead>,
    createDateColumn('created_at', 'Creado') as ColumnDef<Lead>,
    createAvatarColumn('first_name', 'Lead', {
      primaryField: 'first_name',
      secondaryField: 'last_name',
      subtitleField: 'email',
    }) as ColumnDef<Lead>,
    {
      accessorKey: 'business_or_person_name',
      header: 'Empresa/Consorcio',
      cell: ({ row }) => {
        const lead = row.original;
        const name = lead.business_or_person_name;
        const typeLabel = LeadEntityTypeLabels[lead.type_entity];
        const ruc = lead.ruc;
        return name ? (
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-muted-foreground">{typeLabel}</div>
            {ruc && <div className="text-xs text-muted-foreground">RUC: {ruc}</div>}
          </div>
        ) : (
          <span className="text-muted-foreground">Sin entidad</span>
        );
      },
    } as ColumnDef<Lead>,
    createSortableColumn('job_title', 'Cargo') as ColumnDef<Lead>,
    {
      accessorKey: 'assigned_user',
      header: 'Asignado',
      cell: ({ row }) => {
        const lead = row.original;
        const assignedUser = lead.assigned_user;
        if (!assignedUser) {
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
          assignedUser.name.split(' ')[0],
          assignedUser.name.split(' ').slice(1).join(' ')
        );
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
              {initials}
            </div>
            <div>
              <div className="font-medium text-sm">{assignedUser.name}</div>
              <div className="text-xs text-muted-foreground">{assignedUser.email}</div>
            </div>
          </div>
        );
      },
    } as ColumnDef<Lead>,
    createBadgeColumn('status', 'Estado', statusColors, getLeadStatusLabel) as ColumnDef<Lead>,
    createBadgeColumn('source', 'Fuente', sourceColors, getLeadSourceLabel) as ColumnDef<Lead>,
    createBadgeColumn('platform', 'Plataforma', platformColors, (value) =>
      getPlatformLabel(value)
    ) as ColumnDef<Lead>,
    createProgressColumn('score', 'Score') as ColumnDef<Lead>,
    createCurrencyColumn('estimated_value', 'Valor Est.') as ColumnDef<Lead>,
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const lead = row.original;
        const actions = [
          {
            label: 'Copiar email',
            onClick: () => lead.email && copyEmailToClipboard(lead.email),
          },
          {
            label: 'Editar lead',
            onClick: () => onEdit?.(lead),
            separator: true,
          },
          {
            label: 'Marcar como contactado',
            onClick: () => onStatusChange?.(lead.id, 'contacted'),
          },
          {
            label: 'Marcar como calificado',
            onClick: () => onStatusChange?.(lead.id, 'qualified'),
          },
          lead.status === 'deals'
            ? {
                label: 'Agregar prospecto',
                onClick: () => {
                  (handleSendToDeals(lead), setType('add'));
                },
                separator: true,
              }
            : {
                label: 'Enviar a Deals',
                onClick: () => {
                  (handleSendToDeals(lead), setType('new'));
                },
                separator: true,
              },
          {
            label: 'Eliminar lead',
            onClick: () => onDelete?.(lead.id),
            variant: 'destructive',
          },
        ];

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((action, index) => (
                <React.Fragment key={index}>
                  {action.separator && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={action.onClick}
                    className={action.variant === 'destructive' ? 'text-destructive' : ''}
                  >
                    {action.label}
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    } as ColumnDef<Lead>,
  ];

  return (
    <>
      <DataTable
        data={leads}
        loading={isLoading}
        columns={columns}
        pagination={pagination}
        onPageChange={onPageChange}
        urlSearchKey={urlSearchKey}
        searchPlaceholder="Buscar leads..."
        onSearch={onSearch}
        emptyMessage="No se encontraron leads."
      />
      <SendToDealsModal
        isOpen={isDealsModalOpen}
        type={type}
        onClose={() => setIsDealsModalOpen(false)}
        lead={selectedLead}
        onSubmit={handleDealsSubmit}
      />
    </>
  );
}
