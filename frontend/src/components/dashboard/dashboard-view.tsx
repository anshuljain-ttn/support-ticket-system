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
import { useDashboardStats } from '@/hooks/use-ticket-stats';
import { ApiClientError } from '@/services/api-client';

export function DashboardView() {
  const dashboardQuery = useDashboardStats();

  const errorMessage =
    dashboardQuery.error instanceof ApiClientError
      ? dashboardQuery.error.message
      : 'Unable to load dashboard statistics.';

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
          <h2 className="text-lg font-semibold">Statistics</h2>
          {dashboardQuery.isLoading ? <StatsCardsSkeleton /> : null}
          {dashboardQuery.isError ? (
            <ErrorState
              message={errorMessage}
              onRetry={() => {
                void dashboardQuery.refetch();
              }}
            />
          ) : null}
          {dashboardQuery.data ? <StatsCards dashboard={dashboardQuery.data} /> : null}
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

          {dashboardQuery.isLoading ? <TicketTableSkeleton rows={5} /> : null}
          {dashboardQuery.isError ? null : null}
          {dashboardQuery.data ? (
            <RecentTicketsTable tickets={dashboardQuery.data.recentTickets} />
          ) : null}
        </section>
      </div>
    </PageContainer>
  );
}
