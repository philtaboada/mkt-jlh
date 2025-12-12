'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Comercial } from '@/features/leads/types/dashboard';

interface RankingTableProps {
  comercials: Comercial[];
}

const getMedalColor = (position: number) => {
  switch (position) {
    case 1:
      return 'from-yellow-400 to-amber-500 shadow-yellow-400/40';
    case 2:
      return 'from-slate-300 to-gray-400 shadow-slate-300/40';
    case 3:
      return 'from-orange-400 to-amber-600 shadow-orange-400/40';
    default:
      return 'from-primary to-violet-600 shadow-primary/30';
  }
};

export function RankingTable({ comercials }: RankingTableProps) {
  // Ordenar por deals cerrados y limitar a top 5
  const sortedByDeals = [...comercials].sort((a, b) => b.deals_closed - a.deals_closed).slice(0, 5);

  return (
    <Card className="bg-card shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 border-none group h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
      <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-amber-500/10 to-transparent rounded-full blur-xl" />
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="text-xl md:text-2xl font-black text-transparent bg-linear-to-r from-amber-500 to-orange-600 bg-clip-text flex items-center gap-3">
          <div className="p-2 bg-linear-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg shadow-amber-500/30">
            <Trophy className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          Ranking Global
        </CardTitle>
        <p>Top 5 Comerciales con más Deals cerrados en el período seleccionado</p>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground font-bold w-16">#</TableHead>
                <TableHead className="text-muted-foreground font-bold">Comercial</TableHead>
                <TableHead className="text-muted-foreground font-bold text-center">Deals</TableHead>
                <TableHead className="text-muted-foreground font-bold text-center">
                  Conversión
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedByDeals.map((comercial, index) => {
                // Usar conversion_to_deals, nunca NaN
                const conversion =
                  typeof comercial.conversion_to_deals === 'number' &&
                  !isNaN(comercial.conversion_to_deals)
                    ? comercial.conversion_to_deals / 100
                    : 0;
                return (
                  <TableRow
                    key={`ranking-${comercial.name}-${index}`}
                    className={cn(
                      'border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-md',
                      index < 3
                        ? 'bg-linear-to-r from-amber-500/10 via-yellow-500/5 to-orange-500/10 hover:from-amber-500/15 hover:via-yellow-500/10 hover:to-orange-500/15'
                        : 'hover:bg-muted/30'
                    )}
                  >
                    <TableCell>
                      <div className="relative">
                        <Badge
                          className={cn(
                            'text-white border-0 shadow-lg w-10 h-10 flex items-center justify-center text-lg font-bold relative z-10',
                            `bg-linear-to-r ${getMedalColor(index + 1)}`
                          )}
                        >
                          {index + 1}
                        </Badge>
                        {index < 3 && (
                          <div className="absolute -inset-1 bg-linear-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-sm" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        {index < 3 && (
                          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                        )}
                        {comercial.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-linear-to-r from-fuchsia-500 to-pink-600 text-white border-0 shadow-lg shadow-fuchsia-500/30 font-bold px-3 py-1">
                        {comercial.deals_closed}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={cn(
                          'border-0 text-white font-bold shadow-lg px-3 py-1',
                          conversion >= 0.5
                            ? 'bg-linear-to-r from-emerald-400 to-teal-500 shadow-emerald-400/40'
                            : conversion >= 0.3
                              ? 'bg-linear-to-r from-amber-400 to-orange-500 shadow-amber-400/40'
                              : 'bg-linear-to-r from-rose-400 to-pink-500 shadow-rose-400/40'
                        )}
                      >
                        {(conversion * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
