import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import type { LeadsFilters as LeadsFiltersType, LeadSource } from '@/types/lead';
import { LeadStatusLabels, LeadSourceLabels } from '@/lib/constants/leadConstants';
import { useWorkers } from '@/lib/hooks/useWorkers';
import SelectOptions from '../shared/select-options';

interface LeadsFiltersProps {
  filters: LeadsFiltersType;
  onFilterChange: (filters: Partial<LeadsFiltersType>) => void;
}

export default function LeadsFilters({ filters, onFilterChange }: LeadsFiltersProps) {
  const { data: workers, isLoading } = useWorkers();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-3">
        <DropdownMenuLabel>Filtros</DropdownMenuLabel>
        <div className="space-y-2">
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(val) =>
              onFilterChange({ status: val === 'all' ? undefined : (val as any) })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(LeadStatusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <SelectOptions
            placeholder="Fuente del Lead"
            options={[
              { value: 'all', label: 'Todas las fuentes' },
              ...Object.entries(LeadSourceLabels).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
            value={filters.source ?? 'all'}
            onChange={(val) => {
              let source: LeadSource | undefined;
              if (val === 'all' || val == null) {
                source = undefined;
              } else if (Array.isArray(val)) {
                source = val.length > 0 ? (val[0] as LeadSource) : undefined;
              } else {
                source = val as LeadSource;
              }
              onFilterChange({ source });
            }}
          />
          <SelectOptions
            placeholder="Asignado a"
            options={workers?.map((worker) => ({
              value: worker.id,
              label: worker.name,
            }))}
            value={filters.assigned_to ?? 'all'}
            searchable={true}
            onChange={(val) => {
              let assignedTo: string | undefined;
              if (val === 'all' || val == null) {
                assignedTo = undefined;
              } else if (Array.isArray(val)) {
                assignedTo = val.length > 0 ? val[0] : undefined;
              } else {
                assignedTo = val;
              }
              onFilterChange({ assigned_to: assignedTo });
            }}
          />
        </div>

        <DropdownMenuSeparator className="my-2" />
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => onFilterChange({ status: undefined, assigned_to: undefined })}
        >
          Borrar filtros
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
