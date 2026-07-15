'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import {
  LoadingSkeleton,
  StatsCardsSkeleton,
  TicketDetailSkeleton,
  TicketTableSkeleton,
} from '@/components/common/loading-skeleton';
import { Pagination } from '@/components/common/pagination';
import { PageContainer } from '@/components/layout/page-container';
import { PriorityBadge } from '@/components/tickets/priority-badge';
import { StatusBadge } from '@/components/tickets/status-badge';
import { Button } from '@/components/ui/button';
import { TicketPriorities, TicketStatuses } from '@/types/ticket.types';

export default function UiShowcasePage() {
  const [page, setPage] = useState(2);

  return (
    <PageContainer
      title="UI Component Showcase"
      description="Development page for verifying shared UI components (Task C5)."
    >
      <div className="space-y-10">
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Status badges</h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(TicketStatuses).map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Priority badges</h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(TicketPriorities).map((priority) => (
              <PriorityBadge key={priority} priority={priority} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Empty & error states</h3>
          <div className="grid gap-4 lg:grid-cols-2">
            <EmptyState
              title="No tickets found"
              description="Try adjusting your filters or create a new support ticket."
              action={
                <Button type="button" variant="outline">
                  Create ticket
                </Button>
              }
            />
            <ErrorState
              message="Unable to load tickets from the API."
              onRetry={() => {
                toast.message('Retry clicked');
              }}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Loading skeletons</h3>
          <StatsCardsSkeleton />
          <TicketTableSkeleton rows={3} />
          <TicketDetailSkeleton />
          <LoadingSkeleton rows={2} />
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Pagination</h3>
          <Pagination page={page} totalPages={5} onPageChange={setPage} />
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Toast notifications</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => {
                toast.success('Ticket created successfully');
              }}
            >
              Success toast
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                toast.error('Failed to save ticket');
              }}
            >
              Error toast
            </Button>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
