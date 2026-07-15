'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { ErrorState } from '@/components/common/error-state';
import { TicketTableSkeleton } from '@/components/common/loading-skeleton';
import { Pagination } from '@/components/common/pagination';
import { PageContainer } from '@/components/layout/page-container';
import { TicketFilters } from '@/components/tickets/ticket-filters';
import { buildUsersById, TicketTable } from '@/components/tickets/ticket-table';
import { Button } from '@/components/ui/button';
import { useTickets } from '@/hooks/use-tickets';
import { useUsers } from '@/hooks/use-users';
import {
  mergeTicketListSearchParams,
  parseTicketListSearchParams,
  serializeTicketListSearchParams,
} from '@/lib/ticket-list-params';
import { filterAssignableUsers } from '@/lib/users';
import { ApiClientError } from '@/services/api-client';
import type { TicketSearchParams } from '@/types/ticket.types';

export function TicketListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(
    () => parseTicketListSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const ticketsQuery = useTickets(params);
  const usersQuery = useUsers();

  const assignableUsers = useMemo(
    () => filterAssignableUsers(usersQuery.data ?? []),
    [usersQuery.data],
  );

  const usersById = useMemo(
    () => buildUsersById(usersQuery.data ?? []),
    [usersQuery.data],
  );

  const updateParams = useCallback(
    (updates: Partial<TicketSearchParams>) => {
      const nextParams = mergeTicketListSearchParams(params, updates);
      const query = serializeTicketListSearchParams(nextParams);
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [params, pathname, router],
  );

  const resetParams = useCallback(() => {
    router.replace(pathname);
  }, [pathname, router]);

  const ticketsErrorMessage =
    ticketsQuery.error instanceof ApiClientError
      ? ticketsQuery.error.message
      : 'Unable to load tickets.';

  return (
    <PageContainer
      title="Tickets"
      description="Browse, filter, and search support tickets."
      actions={
        <Button render={<Link href="/tickets/new" />} nativeButton={false}>
          New ticket
        </Button>
      }
    >
      <div className="space-y-6">
        <TicketFilters
          params={params}
          users={assignableUsers}
          onApply={updateParams}
          onReset={resetParams}
        />

        {ticketsQuery.isLoading ? <TicketTableSkeleton rows={params.limit ?? 10} /> : null}

        {ticketsQuery.isError ? (
          <ErrorState
            message={ticketsErrorMessage}
            onRetry={() => {
              void ticketsQuery.refetch();
            }}
          />
        ) : null}

        {ticketsQuery.data ? (
          <>
            <TicketTable
              tickets={ticketsQuery.data.items}
              usersById={usersById}
              emptyDescription={
                params.q || params.status?.length || params.priority?.length || params.assignedTo
                  ? 'No tickets match the current filters.'
                  : 'Create a support ticket to get started.'
              }
            />

            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                Showing page {ticketsQuery.data.pagination.page} of{' '}
                {Math.max(ticketsQuery.data.pagination.totalPages, 1)} (
                {ticketsQuery.data.pagination.total} total)
              </p>
              <Pagination
                page={ticketsQuery.data.pagination.page}
                totalPages={Math.max(ticketsQuery.data.pagination.totalPages, 1)}
                onPageChange={(page) => {
                  updateParams({ page });
                }}
                disabled={ticketsQuery.isFetching}
              />
            </div>
          </>
        ) : null}
      </div>
    </PageContainer>
  );
}
