'use client';

import Link from 'next/link';

import { RecentTicketsTable } from '@/components/dashboard/recent-tickets-table';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ErrorState } from '@/components/common/error-state';
import {
  StatsCardsSkeleton,
  TicketTableSkeleton,
} from '@/components/common/loading-skeleton';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { useTickets } from '@/hooks/use-tickets';
import { useTicketStats } from '@/hooks/use-ticket-stats';
import { ApiClientError } from '@/services/api-client';

const RECENT_TICKETS_LIMIT = 5;

export function DashboardView() {
  const statsQuery = useTicketStats();
  const ticketsQuery = useTickets({
    page: 1,
    limit: RECENT_TICKETS_LIMIT,
    sort: 'newest',
  });

  const statsErrorMessage =
    statsQuery.error instanceof ApiClientError
      ? statsQuery.error.message
      : 'Unable to load dashboard statistics.';

  const ticketsErrorMessage =
    ticketsQuery.error instanceof ApiClientError
      ? ticketsQuery.error.message
      : 'Unable to load recent tickets.';

  return (
    <PageContainer
      title="Dashboard"
      description="Overview of ticket workload and recent activity."
      actions={
        <Button render={<Link href="/tickets/new" />} nativeButton={false}>
          New ticket
        </Button>
      }
    >
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Statistics by status</h2>
          {statsQuery.isLoading ? <StatsCardsSkeleton /> : null}
          {statsQuery.isError ? (
            <ErrorState
              message={statsErrorMessage}
              onRetry={() => {
                void statsQuery.refetch();
              }}
            />
          ) : null}
          {statsQuery.data ? <StatsCards stats={statsQuery.data} /> : null}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Recent tickets</h2>
            <Link
              href="/tickets"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View all
            </Link>
          </div>

          {ticketsQuery.isLoading ? <TicketTableSkeleton rows={RECENT_TICKETS_LIMIT} /> : null}
          {ticketsQuery.isError ? (
            <ErrorState
              message={ticketsErrorMessage}
              onRetry={() => {
                void ticketsQuery.refetch();
              }}
            />
          ) : null}
          {ticketsQuery.data ? (
            <RecentTicketsTable tickets={ticketsQuery.data.items} />
          ) : null}
        </section>
      </div>
    </PageContainer>
  );
}
