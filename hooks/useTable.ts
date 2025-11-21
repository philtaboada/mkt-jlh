import { useState } from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

interface UseTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  initialSorting?: SortingState;
  initialFilters?: ColumnFiltersState;
  initialVisibility?: VisibilityState;
}

export function useTable<TData>({
  data,
  columns,
  initialSorting = [],
  initialFilters = [],
  initialVisibility = {},
}: UseTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialFilters);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialVisibility);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return {
    table,
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    // Utility functions
    setGlobalFilter: (value: string) => {
      table.setGlobalFilter(value);
    },
    clearFilters: () => {
      setColumnFilters([]);
      table.setGlobalFilter('');
    },
    resetSorting: () => {
      setSorting([]);
    },
    toggleColumnVisibility: (columnId: string, visible: boolean) => {
      setColumnVisibility((prev) => ({ ...prev, [columnId]: visible }));
    },
  };
}
