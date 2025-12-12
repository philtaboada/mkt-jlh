'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, CheckCircle, Target, AlertCircle } from 'lucide-react';
import { ProductForType } from '@/features/leads/types/dashboard';

interface ProductChartProps {
  data: ProductForType[];
}

export function ProductsChart({ data }: ProductChartProps) {
  return (
    <>
      {data && data.length > 0 ? (
        <>
          <div className="mb-4">
            <h2 className="text-xl md:text-2xl font-black text-transparent bg-linear-to-r from-violet-500 to-purple-600 bg-clip-text flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/30">
                <Package className="h-5 w-5 text-white" />
              </div>
              Productos
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {data.map((product, index) => (
              <div key={product.product} className="bg-card shadow-xl border-none rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="p-2 rounded-md"
                    style={{ backgroundColor: `hsl(${(index * 45) % 360}, 70%, 92%)` }}
                  >
                    <Package
                      className="w-5 h-5"
                      style={{ color: `hsl(${(index * 45) % 360}, 70%, 45%)` }}
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-transparent bg-linear-to-r from-violet-500 to-purple-600 bg-clip-text">
                    {product.product}
                  </h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <MetricCol
                    value={product.assigned}
                    label="Asignados"
                    icon={<Users className="w-4 h-4" />}
                  />
                  <MetricCol
                    value={product.contacted}
                    label="Contactados"
                    icon={<CheckCircle className="w-4 h-4" />}
                  />
                  <MetricCol
                    value={product.closed}
                    label="Cerrados"
                    icon={<Target className="w-4 h-4" />}
                  />
                  <MetricCol
                    value={product.not_managed}
                    label="No gest."
                    icon={<AlertCircle className="w-4 h-4" />}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-card shadow-xl border border-violet-500/20 rounded-2xl p-8">
          <div className="py-10 text-center text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
            Sin datos de productos disponibles
          </div>
        </div>
      )}
    </>
  );
}

/** Metric as a row: label on left, icon and value on right */
function MetricCol({
  value,
  label,
  icon,
}: {
  value: number;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-2xl font-extrabold leading-none">{value}</span>
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
