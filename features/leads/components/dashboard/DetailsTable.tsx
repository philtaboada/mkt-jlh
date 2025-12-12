'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileBarChart, Users, Target, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Comercial } from '@/features/leads/types/dashboard';

interface DetailsTableProps {
  comercials: Comercial[];
  itemsPerPage?: number;
}

const getConversionColor = (rate: number) => {
  if (rate >= 0.5) return 'bg-linear-to-r from-emerald-400 to-teal-500 shadow-emerald-400/40';
  if (rate >= 0.3) return 'bg-linear-to-r from-amber-400 to-orange-500 shadow-amber-400/40';
  return 'bg-linear-to-r from-rose-400 to-pink-500 shadow-rose-400/40';
};

const getResponseTimeColor = (hours: number) => {
  if (hours <= 24) return 'bg-linear-to-r from-emerald-400 to-teal-500 shadow-emerald-400/40';
  if (hours <= 48) return 'bg-linear-to-r from-amber-400 to-orange-500 shadow-amber-400/40';
  return 'bg-linear-to-r from-rose-400 to-pink-500 shadow-rose-400/40';
};

export function DetailsTable({ comercials, itemsPerPage = 5 }: DetailsTableProps) {
  const [tablePage, setTablePage] = useState(0);
  const totalTablePages = Math.ceil(comercials.length / itemsPerPage);
  const paginatedComercials = comercials.slice(
    tablePage * itemsPerPage,
    (tablePage + 1) * itemsPerPage
  );

  // Reset page when comercials change
  useEffect(() => {
    setTablePage(0);
  }, [comercials.length]);

  const nextTablePage = () => setTablePage((prev) => (prev + 1) % totalTablePages);
  const prevTablePage = () =>
    setTablePage((prev) => (prev - 1 + totalTablePages) % totalTablePages);

  if (comercials.length === 0) {
    return (
      <Card className="bg-card shadow-xl border-none">
        <CardContent className="p-8 text-center">
          <FileBarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hay datos de comerciales disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-xl hover:shadow-sky-500/20 transition-all duration-500 border-none">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl font-black text-foreground flex items-center gap-3">
          <div className="p-2 bg-linear-to-br from-sky-500 to-cyan-600 rounded-lg shadow-lg shadow-sky-500/30">
            <FileBarChart className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          Detalle de Comerciales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-bold">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Comercial
                  </div>
                </TableHead>
                <TableHead className="text-muted-foreground font-bold text-center">
                  Asignados
                </TableHead>
                <TableHead className="text-muted-foreground font-bold text-center">
                  Contactados
                </TableHead>
                <TableHead className="text-muted-foreground font-bold text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Target className="h-4 w-4" />
                    Deals
                  </div>
                </TableHead>
                <TableHead className="text-muted-foreground font-bold text-center">
                  Conversión
                </TableHead>
                <TableHead className="text-muted-foreground font-bold text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    T. Respuesta
                  </div>
                </TableHead>
                <TableHead className="text-muted-foreground font-bold text-center">
                  Llamadas Rep.
                </TableHead>
                <TableHead className="text-muted-foreground font-bold text-center">
                  Sin Gestionar
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedComercials.map((comercial, index) => (
                <TableRow
                  key={`detail-${comercial.name}-${index}`}
                  className="border-border hover:bg-muted/50 transition-all duration-300"
                >
                  <TableCell className="font-semibold text-foreground">{comercial.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-linear-to-r from-primary to-violet-600 text-white border-0 shadow-lg shadow-primary/30">
                      {comercial.assigned_leads}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-linear-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/30">
                      {comercial.contacted_leads}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-linear-to-r from-fuchsia-500 to-pink-600 text-white border-0 shadow-lg shadow-fuchsia-500/30">
                      {comercial.deals_closed}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={cn(
                        'border-0 text-white font-bold shadow-lg',
                        getConversionColor(
                          typeof comercial.conversion_to_deals === 'number' &&
                            !isNaN(comercial.conversion_to_deals)
                            ? comercial.conversion_to_deals / 100
                            : 0
                        )
                      )}
                    >
                      {(
                        (typeof comercial.conversion_to_deals === 'number' &&
                        !isNaN(comercial.conversion_to_deals)
                          ? comercial.conversion_to_deals / 100
                          : 0) * 100
                      ).toFixed(1)}
                      %
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={cn(
                        'border-0 text-white font-bold shadow-lg',
                        getResponseTimeColor(comercial.average_response_time_hours)
                      )}
                    >
                      {comercial.average_response_time_hours.toFixed(2)}h
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-linear-to-r from-rose-500 to-pink-600 text-white border-0 shadow-lg shadow-rose-500/30">
                      {comercial.repet_calls}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-linear-to-r from-gray-500 to-slate-600 text-white border-0 shadow-lg shadow-gray-500/30">
                      {comercial.not_managed_leads}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {totalTablePages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="lg"
              onClick={prevTablePage}
              disabled={tablePage === 0}
              className="bg-card/80 backdrop-blur-lg border-sky-500/30 hover:bg-sky-500/10 hover:border-sky-500 disabled:opacity-30 px-4 py-2 transition-all"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
            <div className="flex gap-2 max-w-[150px] overflow-x-auto py-1">
              {Array.from({ length: Math.min(totalTablePages, 5) }, (_, i) => {
                let pageIndex: number;
                if (totalTablePages <= 5) {
                  pageIndex = i;
                } else if (tablePage < 2) {
                  pageIndex = i;
                } else if (tablePage > totalTablePages - 3) {
                  pageIndex = totalTablePages - 5 + i;
                } else {
                  pageIndex = tablePage - 2 + i;
                }
                return (
                  <button
                    key={`table-dot-${pageIndex}`}
                    onClick={() => setTablePage(pageIndex)}
                    className={cn(
                      'w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 shrink-0',
                      pageIndex === tablePage
                        ? 'bg-sky-500 shadow-lg shadow-sky-500/50 scale-125'
                        : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
                    )}
                  />
                );
              })}
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={nextTablePage}
              disabled={tablePage === totalTablePages - 1}
              className="bg-card/80 backdrop-blur-lg border-sky-500/30 hover:bg-sky-500/10 hover:border-sky-500 disabled:opacity-30 px-4 py-2 transition-all"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
