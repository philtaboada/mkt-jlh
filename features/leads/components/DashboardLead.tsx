'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, parse, isValid } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import { DateRange } from 'react-day-picker';
import { useDashboardCommercial } from '@/features/leads/hooks/useLeads';
import { useWorkers } from '@/hooks/useWorkers';
import {
  DashboardFilters,
  DashboardSummaryCards,
  ComercialSlider,
  ProductsChart,
  RankingTable,
  DetailsTable,
} from './dashboard';

export default function DashboardLeadClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Leer parámetros de URL o usar valores por defecto
  const getInitialStartDate = (): Date | undefined => {
    const param = searchParams.get('startDate');
    if (param) {
      const parsed = parse(param, 'yyyy-MM-dd', new Date());
      return isValid(parsed) ? parsed : new Date(2025, 11, 1);
    }
    return new Date(2025, 11, 1);
  };

  const getInitialEndDate = (): Date | undefined => {
    const param = searchParams.get('endDate');
    if (param) {
      const parsed = parse(param, 'yyyy-MM-dd', new Date());
      return isValid(parsed) ? parsed : new Date(2025, 11, 31);
    }
    return new Date(2025, 11, 31);
  };

  const getInitialWorkers = (): string | string[] | null => {
    const param = searchParams.get('workers');
    if (!param || param === 'all') return 'all';
    return param.split(',');
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: getInitialStartDate(),
    to: getInitialEndDate(),
  });
  const [selectedWorker, setSelectedWorker] = useState<string | string[] | null>(getInitialWorkers);

  // Actualizar URL cuando cambian los filtros
  const updateUrlParams = useCallback(
    (range: DateRange | undefined, workers: string | string[] | null) => {
      const params = new URLSearchParams();

      if (range?.from && isValid(range.from)) {
        params.set('startDate', format(range.from, 'yyyy-MM-dd'));
      }

      if (range?.to && isValid(range.to)) {
        params.set('endDate', format(range.to, 'yyyy-MM-dd'));
      }

      if (workers && workers !== 'all') {
        const workersStr = Array.isArray(workers) ? workers.join(',') : workers;
        params.set('workers', workersStr);
      } else {
        params.set('workers', 'all');
      }

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  // Handlers para actualizar filtros y URL
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    updateUrlParams(range, selectedWorker);
  };

  const handleWorkerChange = (value: string | string[] | null) => {
    setSelectedWorker(value);
    updateUrlParams(dateRange, value);
  };

  const { data: dashboardData, isLoading } = useDashboardCommercial({
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
    workers:
      selectedWorker === 'all' || !selectedWorker
        ? []
        : Array.isArray(selectedWorker)
          ? selectedWorker
          : [selectedWorker],
  });

  const { data: workers } = useWorkers();

  const filteredComercials = useMemo(() => {
    if (selectedWorker === 'all' || !selectedWorker) {
      return dashboardData?.comercials || [];
    }
    return dashboardData?.comercials.filter((c) => selectedWorker.includes(c.worker_id)) || [];
  }, [dashboardData?.comercials, selectedWorker]);

  // Calcular totales generales
  const totals = useMemo(() => {
    return filteredComercials.reduce(
      (acc, comercial) => ({
        totalAssigned: acc.totalAssigned + comercial.assigned_leads,
        totalContacted: acc.totalContacted + comercial.contacted_leads,
        totalDeals: acc.totalDeals + comercial.deals_closed,
        totalNotManaged: acc.totalNotManaged + comercial.not_managed_leads,
        avgConversion:
          acc.avgConversion +
          comercial.conversion_to_deals / 100 / (filteredComercials.length || 1),
        avgResponseTime:
          acc.avgResponseTime +
          comercial.average_response_time_hours / (filteredComercials.length || 1),
      }),
      {
        totalAssigned: 0,
        totalContacted: 0,
        totalDeals: 0,
        totalNotManaged: 0,
        avgConversion: 0,
        avgResponseTime: 0,
      }
    );
  }, [filteredComercials]);

  // Datos para el gráfico de productos
  const productData = useMemo(() => {
    return dashboardData?.product_for_type || [];
  }, [dashboardData?.product_for_type]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-background min-h-screen">
      {/* Header mejorado con fondo gradiente */}
      <header className="relative overflow-hidden rounded-lg shadow-sm">
        <div className="relative px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Títulos compactos */}
          <div className="space-y-0.5">
            <h1 className="text-xl md:text-2xl font-extrabold bg-linear-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent leading-tight">
              Dashboard de Leads
            </h1>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Datos en tiempo real
            </div>
          </div>

          {/* Filtros compactos */}
          <div className="shrink-0">
            <DashboardFilters
              dateRange={dateRange}
              selectedWorker={selectedWorker}
              workers={workers}
              onDateRangeChange={handleDateRangeChange}
              onWorkerChange={handleWorkerChange}
            />
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-primary opacity-20"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Resumen Total */}
          <DashboardSummaryCards totals={totals} />

          {/* Slider de Comerciales */}
          <ComercialSlider comercials={filteredComercials} />

          {/* Gráfico de Productos y Ranking */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Ranking Global - 40% */}
            <div className="lg:col-span-3">
              <RankingTable comercials={filteredComercials} />
            </div>

            {/* Gráfico de Productos - 60% */}
            <div className="lg:col-span-2">
              <ProductsChart data={productData} />
            </div>
          </div>

          {/* Tabla de Detalles */}
          <DetailsTable comercials={filteredComercials} itemsPerPage={5} />
        </>
      )}
    </div>
  );
}
