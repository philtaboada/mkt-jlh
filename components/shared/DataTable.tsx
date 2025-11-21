'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Search, X } from 'lucide-react';
import { PaginatedData } from '@/components/shared/PaginatedData';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { PaginationData } from '@/lib/types/common';
import { TableSkeleton } from './TableSkeleton';
import { UrlSearchInput } from './UrlSearchInput';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  searchColumn?: keyof TData;
  showSearch?: boolean;
  searchPlaceholder?: string;
  urlSearchKey?: string;
  controlledSearch?: {
    value: string;
    onChange: (v: string) => void;
  };
  onSearch?: () => void;
  pagination?: PaginationData;
  controlledSorting?: {
    sorting: SortingState;
    onChange: (s: SortingState) => void;
  };
  onPageChange?: (pageIndex: number, pageSize: number) => void;
  showSelection?: boolean;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  mobileHiddenColumns?: string[];
}

export function DataTable<TData>({
  columns,
  data,
  searchColumn,
  showSearch = true,
  showSelection = false,
  controlledSearch,
  urlSearchKey,
  onSearch,
  pagination,
  searchPlaceholder,
  controlledSorting,
  loading = false,
  error = null,
  emptyMessage = 'No se encontraron registros.',
  mobileHiddenColumns = [],
  onPageChange: onPageChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const isServerSide = !!pagination;

  const paginationState: any = isServerSide ? undefined : undefined;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: controlledSorting ? controlledSorting.sorting : sorting,
      columnFilters,
      columnVisibility,
      pagination: paginationState,
      rowSelection,
    },
    manualPagination: isServerSide,
    pageCount: isServerSide ? pagination!.totalPages : undefined,
    onSortingChange: (updaterOrValue) => {
      if (controlledSorting) {
        if (typeof updaterOrValue === 'function') {
          const next = (updaterOrValue as (old: SortingState) => SortingState)(
            controlledSorting.sorting
          );
          controlledSorting.onChange(next);
        } else {
          controlledSorting.onChange(updaterOrValue as SortingState);
        }
      } else {
        setSorting(updaterOrValue as any);
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    ...(isServerSide ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between pb-2 sticky top-0 bg-white dark:bg-zinc-900 z-20 border-b">
        <div className="flex items-center gap-4">
          {urlSearchKey ? (
            <UrlSearchInput
              placeholder={searchPlaceholder || 'Buscar registros...'}
              paramKey={urlSearchKey}
              onSearch={onSearch}
            />
          ) : controlledSearch ? (
            <div className="relative flex items-center gap-2">
              <span className="absolute left-3 text-muted-foreground">
                <Search className="h-4 w-4" />
              </span>
              <Input
                placeholder="Buscar registros..."
                value={controlledSearch.value}
                onChange={(e) => controlledSearch.onChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onSearch) {
                    onSearch();
                  }
                }}
                className="max-w-sm pl-9 pr-8 focus:ring-2 focus:ring-primary/40 transition-all duration-150"
              />
              {controlledSearch.value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    controlledSearch.onChange('');
                    if (onSearch) onSearch();
                  }}
                  className="absolute right-2 h-8 w-8 p-0"
                  tabIndex={-1}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            showSearch &&
            searchColumn && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </span>
                <Input
                  placeholder={searchPlaceholder}
                  value={
                    (table.getColumn(searchColumn as string)?.getFilterValue() as string) ?? ''
                  }
                  onChange={(e) =>
                    table.getColumn(searchColumn as string)?.setFilterValue(e.target.value)
                  }
                  className="max-w-md pl-9 pr-8 focus:ring-2 focus:ring-primary/40 transition-all duration-150"
                />
              </div>
            )
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-transparent">
              Columnas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading && <TableSkeleton columns={columns.length} showSearch={showSearch} />}

      {error && (
        <div className="text-center py-8 text-red-500 bg-red-50 rounded-md border border-red-200 mx-4">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-md border overflow-auto shadow-sm bg-white dark:bg-zinc-900 dark:border-zinc-800">
          <Table className="min-w-full">
            <TableHeader className="bg-muted/5">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id} className="border-b">
                  {showSelection && (
                    <TableHead className="bg-muted/5 text-xs uppercase tracking-wide text-muted-foreground sticky top-0 z-10 px-4 py-3 w-12">
                      <Checkbox
                        checked={
                          table.getIsAllPageRowsSelected() ||
                          (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}
                  {group.headers.map((header) => {
                    const content = header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext());

                    const canSort = header.column.getCanSort && header.column.getCanSort();
                    const isHiddenOnMobile = mobileHiddenColumns.includes(header.column.id);

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          'bg-muted/5 text-xs uppercase tracking-wide text-muted-foreground font-bold',
                          'sticky top-0 z-10',
                          'px-4 py-3',
                          isHiddenOnMobile && 'hidden md:table-cell',
                          header.column.id === 'actions' && 'sticky right-0 bg-muted/5 z-20'
                        )}
                      >
                        {canSort ? (
                          <>{content}</>
                        ) : (
                          <div className="truncate font-bold">{content}</div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      'hover:bg-muted/5 transition-colors',
                      'data-[state=selected]:bg-muted/10 data-[state=selected]:border-l-2 data-[state=selected]:border-l-primary',
                      index % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-muted/2 dark:bg-zinc-800'
                    )}
                  >
                    {showSelection && (
                      <TableCell className="w-12 px-4">
                        <Checkbox
                          checked={row.getIsSelected()}
                          onCheckedChange={(v) => row.toggleSelected(!!v)}
                          aria-label="Select row"
                        />
                      </TableCell>
                    )}
                    {row.getVisibleCells().map((cell) => {
                      const isHiddenOnMobile = mobileHiddenColumns.includes(cell.column.id);
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            'px-4 py-3',
                            isHiddenOnMobile && 'hidden md:table-cell',
                            cell.column.id === 'actions' &&
                              'sticky right-0 bg-white dark:bg-zinc-900 z-20'
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (showSelection ? 1 : 0)}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <>
              {table.getFilteredSelectedRowModel().rows.length} de{' '}
              {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
            </>
          )}
        </div>

        {pagination ? (
          <PaginatedData
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            pageCount={pagination.totalPages}
            total={pagination.total}
            onPageChange={onPageChange ?? (() => {})}
          />
        ) : (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  aria-disabled={!table.getCanPreviousPage()}
                  className={cn(
                    'mr-2',
                    !table.getCanPreviousPage() && 'pointer-events-none opacity-50'
                  )}
                />
              </PaginationItem>

              {/* Render page numbers with a small window around current page */}
              {(() => {
                const total = table.getPageCount();
                const current = table.getState().pagination.pageIndex + 1;
                const delta = 2;
                const left = Math.max(1, current - delta);
                const right = Math.min(total, current + delta);
                const pages: number[] = [];
                for (let i = left; i <= right; i++) pages.push(i);

                const items: React.ReactNode[] = [];

                if (left > 1) {
                  items.push(
                    <PaginationItem key={1}>
                      <PaginationLink onClick={() => table.setPageIndex(0)}>1</PaginationLink>
                    </PaginationItem>
                  );
                  if (left > 2) {
                    items.push(
                      <PaginationItem key="start-ellipsis">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                }

                pages.forEach((p) => {
                  items.push(
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === current}
                        onClick={() => table.setPageIndex(p - 1)}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                });

                if (right < total) {
                  if (right < total - 1) {
                    items.push(
                      <PaginationItem key="end-ellipsis">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  items.push(
                    <PaginationItem key={total}>
                      <PaginationLink onClick={() => table.setPageIndex(total - 1)}>
                        {total}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }

                return items;
              })()}

              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  aria-disabled={!table.getCanNextPage()}
                  className={cn(
                    'ml-2',
                    !table.getCanNextPage() && 'pointer-events-none opacity-50'
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
