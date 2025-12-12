'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Target,
  Clock,
  Package,
  Box,
  ShoppingCart,
  Briefcase,
  Building,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, Label } from 'recharts';

import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { Comercial } from '@/features/leads/types/dashboard';

interface ComercialSliderProps {
  comercials: Comercial[];
}

export function ComercialSlider({ comercials }: ComercialSliderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = comercials.length;
  const currentComercial = comercials[currentPage];
  const [activeProduct, setActiveProduct] = useState<string>('');

  useEffect(() => {
    setCurrentPage(0);
  }, [comercials.length]);

  useEffect(() => {
    if (currentComercial?.total_leads?.length > 0) {
      setActiveProduct('total');
    }
  }, [currentComercial]);

  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 30000);
    return () => clearInterval(interval);
  }, [totalPages]);

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

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

  const COLORS = [
    'hsl(210, 100%, 50%)',
    'hsl(160, 100%, 40%)',
    'hsl(45, 100%, 50%)',
    'hsl(0, 100%, 50%)',
    'hsl(270, 100%, 65%)',
    'hsl(120, 100%, 40%)',
  ];

  // More vibrant colors for the chart
  const CHART_COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Light Purple
    '#85C1E9', // Light Blue
  ];

  const getProductIcon = (index: number) => {
    const icons = [Package, Box, ShoppingCart, Briefcase, Building, FileText];
    const IconComponent = icons[index % icons.length];
    return IconComponent;
  };

  // Create chart config for products
  const productConfig = useMemo(() => {
    const config: any = {
      quantity: {
        label: 'Cantidad',
      },
    };
    currentComercial?.total_leads?.forEach((lead, idx) => {
      config[lead.product] = {
        label: lead.product,
        color: CHART_COLORS[idx % CHART_COLORS.length],
      };
    });
    return config;
  }, [currentComercial]);

  const activeIndex = useMemo(
    () =>
      activeProduct === 'total'
        ? -1
        : (currentComercial?.total_leads?.findIndex((item) => item.product === activeProduct) ?? 0),
    [currentComercial, activeProduct]
  );

  const totalQuantity = useMemo(
    () => currentComercial?.total_leads?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [currentComercial]
  );

  const products = useMemo(
    () => ['total', ...(currentComercial?.total_leads?.map((item) => item.product) ?? [])],
    [currentComercial]
  );

  if (comercials.length === 0) {
    return (
      <Card className="bg-card border border-border p-8 text-center max-w-md mx-auto">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No hay comerciales disponibles con los filtros seleccionados
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {currentComercial && (
        <Card className="relative overflow-hidden border-none shadow-2xl hover:shadow-primary/20 transition-all duration-500  group max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-linear-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-linear-to-br from-violet-500/10 to-transparent rounded-full blur-2xl" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-xl md:text-2xl font-black text-transparent bg-linear-to-r from-primary to-violet-500 bg-clip-text flex items-center gap-4">
              <div className="p-2 bg-linear-to-br from-primary to-violet-600 rounded-xl shadow-lg shadow-primary/30">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              {currentComercial.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
              <div className="flex justify-between items-center p-2 md:p-3 rounded-xl bg-primary/10  border-none backdrop-blur-sm hover:bg-primary/15 transition-colors">
                <span className="text-base md:text-lg font-semibold text-primary">Asignados:</span>
                <Badge className="bg-linear-to-r from-primary to-violet-600 text-white border-0 shadow-lg shadow-primary/30 text-base md:text-lg px-3 py-1">
                  {currentComercial.assigned_leads}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 md:p-3 rounded-xl bg-emerald-500/10 border-none backdrop-blur-sm hover:bg-emerald-500/15 transition-colors">
                <span className="text-base md:text-lg font-semibold text-emerald-400">
                  Contactados:
                </span>
                <Badge className="bg-linear-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/30 text-base md:text-lg px-3 py-1">
                  {currentComercial.contacted_leads}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 md:p-3 rounded-xl bg-fuchsia-500/10 border-none backdrop-blur-sm hover:bg-fuchsia-500/15 transition-colors">
                <span className="text-base md:text-lg font-semibold text-fuchsia-400 flex items-center gap-2">
                  <Target className="h-4 w-4 md:h-5 md:w-5" />
                  Deals:
                </span>
                <Badge className="bg-linear-to-r from-fuchsia-500 to-pink-600 text-white border-0 shadow-lg shadow-fuchsia-500/30 text-base md:text-lg px-3 py-1">
                  {currentComercial.deals_closed}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 md:p-3 rounded-xl bg-amber-500/10 border-none backdrop-blur-sm hover:bg-amber-500/15 transition-colors">
                <span className="text-base md:text-lg font-semibold text-amber-400">
                  Conversión:
                </span>
                <Badge
                  className={cn(
                    'border-0 text-white font-bold shadow-lg text-base md:text-lg px-3 py-1',
                    getConversionColor(
                      typeof currentComercial.conversion_to_deals === 'number' &&
                        !isNaN(currentComercial.conversion_to_deals)
                        ? currentComercial.conversion_to_deals / 100
                        : 0
                    )
                  )}
                >
                  {(
                    (typeof currentComercial.conversion_to_deals === 'number' &&
                    !isNaN(currentComercial.conversion_to_deals)
                      ? currentComercial.conversion_to_deals / 100
                      : 0) * 100
                  ).toFixed(1)}
                  %
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 md:p-3 rounded-xl bg-sky-500/10 border-none backdrop-blur-sm hover:bg-sky-500/15 transition-colors">
                <span className="text-base md:text-lg font-semibold text-sky-400 flex items-center gap-2">
                  <Clock className="h-4 w-4 md:h-5 md:w-5" />
                  T. Resp:
                </span>
                <Badge
                  className={cn(
                    'border-0 text-white font-bold shadow-lg text-base md:text-lg px-3 py-1',
                    getResponseTimeColor(currentComercial.average_response_time_hours)
                  )}
                >
                  {currentComercial.average_response_time_hours.toFixed(2)}h
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 md:p-3 rounded-xl bg-rose-500/10 border-none backdrop-blur-sm hover:bg-rose-500/15 transition-colors">
                <span className="text-base md:text-lg font-semibold text-rose-400">
                  Llamadas Repetidas:
                </span>
                <Badge className="bg-linear-to-r from-rose-500 to-pink-600 text-white border-0 shadow-lg shadow-rose-500/30 text-base md:text-lg px-3 py-1">
                  {currentComercial.repet_calls}
                </Badge>
              </div>
            </div>
            <div className="mt-4 md:mt-6 p-3 md:p-4 rounded-xl bg-linear-to-br from-card via-card/95 to-card/90 border-none backdrop-blur-sm shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-linear-to-br from-violet-500 to-purple-600 rounded-lg shadow-lg shadow-violet-500/30">
                    <Target className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <span className="text-lg md:text-xl font-bold text-transparent bg-linear-to-r from-violet-500 to-purple-600 bg-clip-text">
                    Productos
                  </span>
                </div>
                <Select value={activeProduct} onValueChange={setActiveProduct}>
                  <SelectTrigger className="w-[140px] h-8 rounded-lg">
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent align="end" className="rounded-xl">
                    {products.map((product, idx) => (
                      <SelectItem
                        key={product}
                        value={product}
                        className="rounded-lg [&_span]:flex"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          {product === 'total' ? (
                            <span className="flex h-3 w-3 shrink-0 rounded-xs bg-primary" />
                          ) : (
                            <span
                              className="flex h-3 w-3 shrink-0 rounded-xs"
                              style={{
                                backgroundColor: CHART_COLORS[(idx - 1) % CHART_COLORS.length],
                              }}
                            />
                          )}
                          {product === 'total' ? 'Total' : product}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <main className="flex w-full flex-col items-center md:flex-row md:gap-6">
                <div className="md:flex-1 md:max-w-md space-y-3 mb-4 md:mb-0">
                  <div className="grid grid-cols-1 gap-2">
                    {currentComercial.total_leads.map((lead, idx) => {
                      const IconComponent = getProductIcon(idx);
                      return (
                        <div
                          key={idx}
                          className={cn(
                            'relative p-3 bg-linear-to-r from-secondary/60 to-secondary/40 rounded-xl border-none backdrop-blur-sm hover:from-secondary/70 hover:to-secondary/50 transition-all duration-300 group overflow-hidden',
                            activeProduct === lead.product && 'ring-2 ring-primary/50 shadow-lg'
                          )}
                        >
                          <div
                            className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
                            style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="p-1.5 rounded-lg"
                                style={{
                                  backgroundColor: `${CHART_COLORS[idx % CHART_COLORS.length]}20`,
                                }}
                              >
                                <IconComponent
                                  className="w-4 h-4"
                                  style={{ color: CHART_COLORS[idx % CHART_COLORS.length] }}
                                />
                              </div>
                              <p className="text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
                                {lead.product}
                              </p>
                            </div>
                            <Badge className="bg-linear-to-r from-primary/80 to-primary text-white border-0 shadow-sm text-sm px-2 py-1">
                              {lead.quantity}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="md:flex-1 flex flex-col items-center">
                  <div className="w-full max-w-[300px] mx-auto">
                    {currentComercial.total_leads && currentComercial.total_leads.length > 0 ? (
                      <ChartContainer
                        config={productConfig}
                        className="mx-auto aspect-square w-full"
                      >
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Pie
                            data={currentComercial.total_leads as any}
                            dataKey="quantity"
                            nameKey="product"
                            innerRadius={60}
                            strokeWidth={5}
                          >
                            {currentComercial.total_leads.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                              />
                            ))}
                            <Label
                              content={({ viewBox }) => {
                                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                  const displayValue =
                                    activeProduct === 'total'
                                      ? totalQuantity
                                      : (currentComercial.total_leads[activeIndex]?.quantity ?? 0);
                                  return (
                                    <text
                                      x={viewBox.cx}
                                      y={viewBox.cy}
                                      textAnchor="middle"
                                      dominantBaseline="middle"
                                    >
                                      <tspan
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        className="fill-foreground text-2xl font-bold"
                                      >
                                        {displayValue.toLocaleString()}
                                      </tspan>
                                      <tspan
                                        x={viewBox.cx}
                                        y={(viewBox.cy || 0) + 24}
                                        className="fill-muted-foreground text-sm"
                                      >
                                        {activeProduct === 'total'
                                          ? 'Total Productos'
                                          : 'Productos'}
                                      </tspan>
                                    </text>
                                  );
                                }
                              }}
                            />
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        Sin datos de productos
                      </div>
                    )}
                  </div>
                </div>
              </main>
            </div>
          </CardContent>
        </Card>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={prevPage}
            disabled={currentPage === 0}
            className="bg-card/80 backdrop-blur-lg border-none disabled:opacity-30 px-4 py-2 transition-all"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <div className="flex gap-2 max-w-[150px] overflow-x-auto py-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageIndex: number;
              if (totalPages <= 5) {
                pageIndex = i;
              } else if (currentPage < 2) {
                pageIndex = i;
              } else if (currentPage > totalPages - 3) {
                pageIndex = totalPages - 5 + i;
              } else {
                pageIndex = currentPage - 2 + i;
              }
              return (
                <button
                  key={`slider-dot-${pageIndex}`}
                  onClick={() => setCurrentPage(pageIndex)}
                  className={cn(
                    'w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 shrink-0',
                    pageIndex === currentPage
                      ? 'bg-primary shadow-lg shadow-primary/50 scale-125'
                      : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
                  )}
                />
              );
            })}
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className="bg-card/80 backdrop-blur-lg border-primary/30 hover:bg-primary/10 hover:border-primary disabled:opacity-30 px-4 py-2 transition-all"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
