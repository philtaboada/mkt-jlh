'use client';

import React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter } from 'lucide-react';
import { useWorkers } from '@/lib/hooks/useWorkers';
import { LeadProductTypeLabels } from '@/lib/constants/leadConstants';
import { Checkbox } from '@/components/ui/checkbox';
import { SeaceDataTypeLabels } from '@/lib/constants/seaceConstants';

interface FilterProspectProps {
  onFiltersChange?: (filters: GetProspectsParams) => void;
}

export interface GetProspectsParams {
  page_index?: number;
  page_size?: number;
  workers?: string[];
  statuscode?: number[];
  typeproduct?: string[];
  search?: string;
  start_date?: string;
  end_date?: string;
}

const statusOptions = Object.entries(SeaceDataTypeLabels).map(([key, label]) => ({
  value: Number(key),
  label: label as string,
}));

const productTypeOptions = Object.entries(LeadProductTypeLabels).map(([key, label]) => ({
  value: key,
  label,
}));

export function FilterProspect({ onFiltersChange }: FilterProspectProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: workers = [] } = useWorkers();

  const [initialized, setInitialized] = React.useState(false);
  const [selectedWorkers, setSelectedWorkers] = React.useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState<number[]>([]);
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState('');
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();

  React.useEffect(() => {
    if (!initialized) {
      const workersParam = searchParams.get('workers')?.split(',') || [];
      const statuscode = searchParams.get('statuscode')?.split(',').map(Number) || [];
      const typeproduct = searchParams.get('typeproduct')?.split(',') || [];
      const searchParam = searchParams.get('search') || '';
      const start_date = searchParams.get('start_date')
        ? new Date(searchParams.get('start_date')!)
        : undefined;
      const end_date = searchParams.get('end_date')
        ? new Date(searchParams.get('end_date')!)
        : undefined;

      setSelectedWorkers(workersParam);
      setSelectedStatuses(statuscode);
      setSelectedProducts(typeproduct);
      setSearch(searchParam);
      setStartDate(start_date);
      setEndDate(end_date);
      setInitialized(true);
    }
  }, [searchParams, initialized]);

  const updateURL = (params: Record<string, string | string[]>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          newParams.set(key, value.join(','));
        } else {
          newParams.delete(key);
        }
      } else if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleWorkersChange = (workerId: string, checked: boolean) => {
    const newWorkers = checked
      ? [...selectedWorkers, workerId]
      : selectedWorkers.filter((id) => id !== workerId);
    setSelectedWorkers(newWorkers);
    updateURL({ workers: newWorkers });
    onFiltersChange?.({
      workers: newWorkers,
      statuscode: selectedStatuses,
      typeproduct: selectedProducts,
      search,
      start_date: startDate?.toISOString().split('T')[0],
      end_date: endDate?.toISOString().split('T')[0],
    });
  };

  const handleStatusesChange = (status: number, checked: boolean) => {
    const newStatuses = checked
      ? [...selectedStatuses, status]
      : selectedStatuses.filter((s) => s !== status);
    setSelectedStatuses(newStatuses);
    updateURL({ statuscode: newStatuses.map(String) });
    onFiltersChange?.({
      workers: selectedWorkers,
      statuscode: newStatuses,
      typeproduct: selectedProducts,
      search,
      start_date: startDate?.toISOString().split('T')[0],
      end_date: endDate?.toISOString().split('T')[0],
    });
  };

  const handleProductsChange = (product: string, checked: boolean) => {
    const newProducts = checked
      ? [...selectedProducts, product]
      : selectedProducts.filter((p) => p !== product);
    setSelectedProducts(newProducts);
    updateURL({ typeproduct: newProducts });
    onFiltersChange?.({
      workers: selectedWorkers,
      statuscode: selectedStatuses,
      typeproduct: newProducts,
      search,
      start_date: startDate?.toISOString().split('T')[0],
      end_date: endDate?.toISOString().split('T')[0],
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    updateURL({ search: value });
    onFiltersChange?.({
      workers: selectedWorkers,
      statuscode: selectedStatuses,
      typeproduct: selectedProducts,
      search: value,
      start_date: startDate?.toISOString().split('T')[0],
      end_date: endDate?.toISOString().split('T')[0],
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    updateURL({ start_date: date ? date.toISOString().split('T')[0] : '' });
    onFiltersChange?.({
      workers: selectedWorkers,
      statuscode: selectedStatuses,
      typeproduct: selectedProducts,
      search,
      start_date: date?.toISOString().split('T')[0],
      end_date: endDate?.toISOString().split('T')[0],
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    updateURL({ end_date: date ? date.toISOString().split('T')[0] : '' });
    onFiltersChange?.({
      workers: selectedWorkers,
      statuscode: selectedStatuses,
      typeproduct: selectedProducts,
      search,
      start_date: startDate?.toISOString().split('T')[0],
      end_date: date?.toISOString().split('T')[0],
    });
  };

  const clearFilters = () => {
    setSelectedWorkers([]);
    setSelectedStatuses([]);
    setSelectedProducts([]);
    setSearch('');
    setStartDate(undefined);
    setEndDate(undefined);
    router.push('?');
    onFiltersChange?.({});
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="justify-start">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
          {(selectedWorkers.length > 0 ||
            selectedStatuses.length > 0 ||
            selectedProducts.length > 0 ||
            search ||
            startDate ||
            endDate) && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
              {selectedWorkers.length +
                selectedStatuses.length +
                selectedProducts.length +
                (search ? 1 : 0) +
                (startDate ? 1 : 0) +
                (endDate ? 1 : 0)}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-4" align="start">
        <div className="flex flex-col space-y-4">
          <div>
            <label className="text-sm font-medium">Trabajadores</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start mt-1">
                  Seleccionar trabajadores ({selectedWorkers.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {workers.map((worker) => (
                    <div key={worker.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`worker-${worker.id}`}
                        checked={selectedWorkers.includes(worker.id)}
                        onCheckedChange={(checked) =>
                          handleWorkersChange(worker.id, checked as boolean)
                        }
                      />
                      <label htmlFor={`worker-${worker.id}`} className="text-sm">
                        {worker.name}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium">Estado</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start mt-1">
                  Seleccionar estados ({selectedStatuses.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {statusOptions.map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={selectedStatuses.includes(statusOptions.indexOf(status))}
                        onCheckedChange={(checked) =>
                          handleStatusesChange(status.value, checked as boolean)
                        }
                      />
                      <label htmlFor={`status-${status.value}`} className="text-sm">
                        {status.label}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium">Tipo de producto</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start mt-1">
                  Seleccionar tipos ({selectedProducts.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {productTypeOptions.map((product) => (
                    <div key={product.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`product-${product.value}`}
                        checked={selectedProducts.includes(product.value)}
                        onCheckedChange={(checked) =>
                          handleProductsChange(product.value, checked as boolean)
                        }
                      />
                      <label htmlFor={`product-${product.value}`} className="text-sm">
                        {product.label}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium">Fecha inicio</label>
              <Input
                type="date"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) =>
                  handleStartDateChange(e.target.value ? new Date(e.target.value) : undefined)
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Fecha fin</label>
              <Input
                type="date"
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) =>
                  handleEndDateChange(e.target.value ? new Date(e.target.value) : undefined)
                }
                className="mt-1"
              />
            </div>
          </div>

          <Button variant="ghost" onClick={clearFilters} className="w-full">
            Limpiar filtros
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
