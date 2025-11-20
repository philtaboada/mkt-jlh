'use client';

import { Users, Check, Percent, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface LeadsStatsCardsProps {
  stats?: {
    total?: number;
    dealsCount?: number;
    conversionRate?: number;
    totalPipeline?: number;
    avgScore?: number;
    hotLeads?: number;
    byStatus?: Record<string, number>;
  };
  isLoading?: boolean;
}

export function LeadsStatsCards({ stats, isLoading }: LeadsStatsCardsProps) {
  const total = stats?.total ?? 0;
  const deals = stats?.dealsCount ?? 0;
  const conversionRate = stats?.conversionRate ? Number(stats.conversionRate.toFixed(1)) : 0;
  const totalPipeline = stats?.totalPipeline ?? 0;
  const avgScore = stats?.avgScore ? Math.round(stats.avgScore) : 0;
  const hotLeads = stats?.hotLeads ?? 0;
  const newLeads = stats?.byStatus?.['new'] ?? 0;
  const contactedLeads = stats?.byStatus?.['contacted'] ?? 0;

  const moneyFormatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const compactCardClass = 'p-2 hover:shadow-md transition-shadow duration-200';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 my-2">
      {/* Total Leads Card */}
      <Card className={`${compactCardClass} border-l-4 border-l-primary/20 hover:border-l-primary`}>
        <CardHeader className="px-2 py-1.5">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Total Leads</span>
            <span className="text-xs text-muted-foreground">
              {newLeads} nuevos · {contactedLeads} contactados
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold">{isLoading ? '—' : total}</div>
              <div className="text-xs text-muted-foreground">leads en sistema</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads en Deals Card */}
      <Card
        className={`${compactCardClass} border-l-4 border-l-green-200 hover:border-l-green-400`}
      >
        <CardHeader className="px-2 py-1.5">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Leads en Deals</span>
            <span className="text-xs text-muted-foreground">
              {hotLeads} hot · Score: {avgScore}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold text-green-600">{isLoading ? '—' : deals}</div>
              <div className="text-xs text-muted-foreground">en cierre</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <Check size={16} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasa de Conversión Card */}
      <Card
        className={`${compactCardClass} border-l-4 border-l-amber-200 hover:border-l-amber-400`}
      >
        <CardHeader className="px-2 py-1.5">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Tasa de Conversión</span>
            <span className="text-xs text-muted-foreground">
              {deals} de {total} leads
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold text-amber-600">
                {isLoading ? '—' : `${conversionRate}%`}
              </div>
              <div className="text-xs text-muted-foreground">efectividad</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Percent size={16} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Valor Pipeline Card */}
      <Card
        className={`${compactCardClass} border-l-4 border-l-indigo-200 hover:border-l-indigo-400`}
      >
        <CardHeader className="px-2 py-1.5">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Valor Pipeline</span>
            <span className="text-xs text-muted-foreground">
              ~${Math.round(totalPipeline / deals).toLocaleString()}/deal
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold text-indigo-600">
                {isLoading ? '—' : moneyFormatter.format(totalPipeline)}
              </div>
              <div className="text-xs text-muted-foreground">total</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
