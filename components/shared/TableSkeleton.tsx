'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showSearch?: boolean;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showSearch = true,
  className = '',
}: TableSkeletonProps) {
  return (
    <div className={`w-full space-y-4 ${className}`}>
      {showSearch && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          </div>
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
        <div className="border-b border-border bg-muted/30 px-6 py-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={`header-${i}`} className="h-5 w-full" />
            ))}
          </div>
        </div>

        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="px-6 py-4 hover:bg-muted/20 transition-colors">
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div key={`cell-${rowIndex}-${colIndex}`} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    {colIndex === 0 && <Skeleton className="h-3 w-3/4" />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}
