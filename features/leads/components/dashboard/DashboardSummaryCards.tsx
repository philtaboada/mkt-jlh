'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, Phone, DollarSign, XCircle, TrendingUp, Clock } from 'lucide-react';

interface DashboardTotals {
  totalAssigned: number;
  totalContacted: number;
  totalDeals: number;
  totalNotManaged: number;
  avgConversion: number;
  avgResponseTime: number;
}

interface DashboardSummaryCardsProps {
  totals: DashboardTotals;
}

export function DashboardSummaryCards({ totals }: DashboardSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-2 md:gap-3">
      <Card className="bg-linear-to-br py-1 from-purple-500/10  to-purple-600/5 border-none transition-all hover:shadow-lg hover:shadow-primary/10">
        <CardContent className="p-1 md:p-2 text-center">
          <Users className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 text-primary" />
          <p className="text-xs md:text-sm text-muted-foreground font-bold">Total Asignados</p>
          <p className="text-base md:text-lg lg:text-xl font-black text-primary">
            {totals.totalAssigned}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Leads asignados a comerciales</p>
        </CardContent>
      </Card>
      <Card className="bg-linear-to-br py-1 from-emerald-500/10 to-emerald-600/5 border-none transition-all hover:shadow-lg hover:shadow-emerald-500/10">
        <CardContent className="p-1 md:p-2 text-center">
          <Phone className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 text-emerald-500" />
          <p className="text-xs md:text-sm text-muted-foreground font-bold">Contactados</p>
          <p className="text-base md:text-lg lg:text-xl font-black text-emerald-500">
            {totals.totalContacted}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Leads contactados por comerciales</p>
        </CardContent>
      </Card>
      <Card className="bg-linear-to-br py-1 from-fuchsia-500/10 to-fuchsia-600/5  border-none transition-all hover:shadow-lg hover:shadow-fuchsia-500/10">
        <CardContent className="p-1 md:p-2 text-center">
          <DollarSign className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 text-fuchsia-500" />
          <p className="text-xs md:text-sm text-muted-foreground font-bold">Total Deals</p>
          <p className="text-base md:text-lg lg:text-xl font-black text-fuchsia-500">
            {totals.totalDeals}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Deals cerrados por comerciales</p>
        </CardContent>
      </Card>
      <Card className="bg-linear-to-br py-1 from-rose-500/10 to-rose-600/5 border-none transition-all hover:shadow-lg hover:shadow-rose-500/10">
        <CardContent className="p-1 md:p-2 text-center">
          <XCircle className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 text-rose-500" />
          <p className="text-xs md:text-sm text-muted-foreground font-bold">No Gestionados</p>
          <p className="text-base md:text-lg lg:text-xl font-black text-rose-500">
            {totals.totalNotManaged}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Leads sin gestionar</p>
        </CardContent>
      </Card>
      <Card className="bg-linear-to-br py-1 from-amber-500/10 to-amber-600/5  border-none transition-all hover:shadow-lg hover:shadow-amber-500/10">
        <CardContent className="p-1 md:p-2 text-center">
          <TrendingUp className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 text-amber-500" />
          <p className="text-xs md:text-sm text-muted-foreground font-bold">Prom. Conversión</p>
          <p className="text-base md:text-lg lg:text-xl font-black text-amber-500">
            {(totals.avgConversion * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Porcentaje promedio de conversión</p>
        </CardContent>
      </Card>
      <Card className="bg-linear-to-br py-1 from-sky-500/10 to-sky-600/5 border-none transition-all hover:shadow-lg hover:shadow-sky-500/10">
        <CardContent className="p-1 md:p-2 text-center">
          <Clock className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 text-sky-500" />
          <p className="text-xs md:text-sm text-muted-foreground font-bold">Prom. T. Resp</p>
          <p className="text-base md:text-lg lg:text-xl font-black text-sky-500">
            {totals.avgResponseTime.toFixed(1)}h
          </p>
          <p className="text-xs text-muted-foreground mt-1">Tiempo promedio de respuesta</p>
        </CardContent>
      </Card>
    </div>
  );
}
