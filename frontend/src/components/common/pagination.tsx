import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
};

function getVisiblePages(page: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  return Array.from({ length: 5 }, (_, index) => start + index);
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={disabled || page <= 1}
        onClick={() => {
          onPageChange(page - 1);
        }}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {visiblePages.map((pageNumber) => (
        <Button
          key={pageNumber}
          type="button"
          variant={pageNumber === page ? 'default' : 'outline'}
          size="sm"
          disabled={disabled}
          onClick={() => {
            onPageChange(pageNumber);
          }}
          aria-label={`Go to page ${pageNumber}`}
          aria-current={pageNumber === page ? 'page' : undefined}
        >
          {pageNumber}
        </Button>
      ))}

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={disabled || page >= totalPages}
        onClick={() => {
          onPageChange(page + 1);
        }}
        aria-label="Go to next page"
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}
