import * as React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginatedDataProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  total: number;
  onPageChange: (pageIndex: number, pageSize: number) => void;
}

export function PaginatedData({
  pageIndex,
  pageSize,
  pageCount,
  total,
  onPageChange,
}: PaginatedDataProps) {
  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, total);
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-4 w-full px-2">
      <div className="text-sm mb-2 md:mb-0 text-center md:text-left w-full md:w-auto">
        Mostrando {start}-{end} de {total} registros
      </div>
      <div className="w-full md:w-auto flex justify-center md:justify-end">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(0, pageIndex - 1), pageSize)}
                aria-disabled={pageIndex <= 0}
              />
            </PaginationItem>
            {(() => {
              const total = pageCount;
              const current = pageIndex + 1;
              const delta = 2;
              const left = Math.max(1, current - delta);
              const right = Math.min(total, current + delta);
              const pages: number[] = [];
              for (let i = left; i <= right; i++) pages.push(i);
              const items: React.ReactNode[] = [];
              if (left > 1) {
                items.push(
                  <PaginationItem key={1}>
                    <PaginationLink onClick={() => onPageChange(0, pageSize)}>1</PaginationLink>
                  </PaginationItem>
                );
                if (left > 2) {
                  items.push(
                    <PaginationItem key="start-ellipsis">
                      <span className="px-2">...</span>
                    </PaginationItem>
                  );
                }
              }
              pages.forEach((p) => {
                items.push(
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === current}
                      onClick={() => onPageChange(p - 1, pageSize)}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                );
              });
              if (right < total) {
                if (right < total - 1) {
                  items.push(
                    <PaginationItem key="end-ellipsis">
                      <span className="px-2">...</span>
                    </PaginationItem>
                  );
                }
                items.push(
                  <PaginationItem key={total}>
                    <PaginationLink onClick={() => onPageChange(total - 1, pageSize)}>
                      {total}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              return items;
            })()}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  onPageChange(Math.min(Math.max(0, pageCount - 1), pageIndex + 1), pageSize)
                }
                aria-disabled={pageIndex >= Math.max(0, pageCount - 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
