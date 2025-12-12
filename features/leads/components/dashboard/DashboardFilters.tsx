'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import SelectOptions from '@/components/shared/select-options';
import { DateRange } from 'react-day-picker';

interface Worker {
  id: string;
  name: string;
}

interface DashboardFiltersProps {
  dateRange: DateRange | undefined;
  selectedWorker: string | string[] | null;
  workers: Worker[] | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onWorkerChange: (value: string | string[] | null) => void;
}

export function DashboardFilters({
  dateRange,
  selectedWorker,
  workers,
  onDateRangeChange,
  onWorkerChange,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full sm:w-80 justify-start text-left font-medium bg-card/80 backdrop-blur-lg border-primary/30 hover:bg-primary/10 hover:border-primary transition-all shadow-md hover:shadow-primary/20',
              !dateRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                </>
              ) : (
                format(dateRange.from, 'LLL dd, y')
              )
            ) : (
              'Seleccionar rango de fechas'
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <SelectOptions
        items={workers}
        value={selectedWorker}
        onChange={onWorkerChange}
        placeholder="Seleccionar comercial"
        multiple
        searchable
        className="w-full sm:w-[250px]"
        valueKey="id"
        labelKey="name"
        noneOption={{ value: 'all', label: 'Todos los comerciales' }}
      />
    </div>
  );
}
