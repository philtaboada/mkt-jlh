import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from './covertDate';

// Column builders for common patterns
export const createSortableColumn = <TData,>(
  key: keyof TData,
  label: string,
  cellRenderer?: (value: any, row: TData) => React.ReactNode
): ColumnDef<TData> => ({
  accessorKey: key as string,
  header: ({ column }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-bold uppercase text-xs"
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  },
  cell: ({ row }) => {
    const value = row.getValue(key as string);
    return cellRenderer ? cellRenderer(value, row.original) : <span>{String(value || '-')}</span>;
  },
});

export const createBadgeColumn = <TData,>(
  key: keyof TData,
  label: string,
  colorMap: Record<string, string>,
  formatter?: (value: any) => string
): ColumnDef<TData> => ({
  accessorKey: key as string,
  header: label,
  cell: ({ row }) => {
    const value = row.getValue(key as string) as string;
    if (!value) return <span className="text-muted-foreground">-</span>;

    const displayValue = formatter ? formatter(value) : value.replace('_', ' ').toUpperCase();
    return <Badge className={colorMap[value] || 'bg-gray-100 text-gray-800'}>{displayValue}</Badge>;
  },
});

export const createAvatarColumn = <TData,>(
  key: keyof TData,
  label: string,
  options: {
    primaryField: keyof TData;
    secondaryField?: keyof TData;
    subtitleField?: keyof TData;
    avatarField?: keyof TData;
  }
): ColumnDef<TData> => ({
  accessorKey: key as string,
  header: label,
  cell: ({ row }) => {
    const data = row.original;
    const primary = String(data[options.primaryField] || '');
    const secondary = options.secondaryField ? String(data[options.secondaryField] || '') : '';
    const subtitle = options.subtitleField ? String(data[options.subtitleField] || '') : '';

    return (
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          {options.avatarField && data[options.avatarField] ? (
            <img src={String(data[options.avatarField])} alt={primary} />
          ) : (
            <AvatarFallback>
              {primary.charAt(0)}
              {secondary.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="font-medium">
            {primary} {secondary}
          </div>
          {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
        </div>
      </div>
    );
  },
});

export const createActionsColumn = <TData,>(
  actions: Array<{
    label: string;
    onClick: (row: TData) => void;
    variant?: 'default' | 'destructive';
    separator?: boolean;
  }>
): ColumnDef<TData> => ({
  id: 'actions',
  enableHiding: false,
  cell: ({ row }) => {
    const data = row.original;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          {actions.map((action, index) => (
            <React.Fragment key={action.label}>
              {action.separator && index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => action.onClick(data)}
                className={action.variant === 'destructive' ? 'text-red-600' : ''}
              >
                {action.label}
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
});

export const createCurrencyColumn = <TData,>(
  key: keyof TData,
  label: string
): ColumnDef<TData> => ({
  accessorKey: key as string,
  header: ({ column }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-bold text-xs uppercase"
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  },
  cell: ({ row }) => {
    const value = row.getValue(key as string) as number;
    return value ? (
      <span className="font-medium">${value.toLocaleString()}</span>
    ) : (
      <span className="text-muted-foreground">-</span>
    );
  },
});

export const createProgressColumn = <TData,>(
  key: keyof TData,
  label: string,
  options?: {
    showValue?: boolean;
    color?: string;
  }
): ColumnDef<TData> => ({
  accessorKey: key as string,
  header: ({ column }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-bold text-xs uppercase"
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  },
  cell: ({ row }) => {
    const score = row.getValue(key as string) as number;
    const { showValue = true, color = 'bg-linear-to-r from-purple-500 to-pink-500' } = options || {};

    return (
      <div className="flex items-center space-x-2">
        <div className="w-12 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className={`${color} h-2 rounded-full transition-all duration-300`} style={{ width: `${score}%` }}></div>
        </div>
        {showValue && <span className="text-sm font-medium">{score}</span>}
      </div>
    );
  },
});

export const createDateColumn = <TData,>(
  key: keyof TData,
  label: string,
  options?: {
    format?: 'short' | 'long';
  }
): ColumnDef<TData> => ({
  accessorKey: key as string,
  header: ({ column }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-bold text-xs uppercase"
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  },
  cell: ({ row }) => {
    const value = row.getValue(key as string) as string | null | undefined;
    if (!value) return <span className="text-muted-foreground">-</span>;

    return <span className="text-sm">{formatDate(value)}</span>;
  },
});
