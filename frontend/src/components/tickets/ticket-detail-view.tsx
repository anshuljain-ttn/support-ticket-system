'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { CommentForm } from '@/components/comments/comment-form';
import { CommentTimeline } from '@/components/comments/comment-timeline';
import { ErrorState } from '@/components/common/error-state';
import { TicketDetailSkeleton } from '@/components/common/loading-skeleton';
import { PageContainer } from '@/components/layout/page-container';
import { AssignmentSelect } from '@/components/tickets/assignment-select';
import { HistoryTimeline } from '@/components/tickets/history-timeline';
import { buildUsersById } from '@/components/tickets/ticket-table';
import { PriorityBadge } from '@/components/tickets/priority-badge';
import { StatusBadge } from '@/components/tickets/status-badge';
import { StatusSelect } from '@/components/tickets/status-select';
import { Button } from '@/components/ui/button';
import { useTicket } from '@/hooks/use-ticket';
import { useUsers } from '@/hooks/use-users';
import { formatDateTime } from '@/lib/format';
import { isValidObjectId } from '@/lib/object-id';
import { ApiClientError } from '@/services/api-client';

type TicketDetailViewProps = {
  ticketId: string;
};

export function TicketDetailView({ ticketId }: TicketDetailViewProps) {
  const ticketQuery = useTicket(ticketId);
  const usersQuery = useUsers();

  const usersById = useMemo(
    () => buildUsersById(usersQuery.data ?? []),
    [usersQuery.data],
  );

  if (!isValidObjectId(ticketId)) {
    return (
      <PageContainer title="Ticket not found" description="The ticket id in the URL is invalid.">
        <ErrorState
          title="Invalid ticket"
          message="This ticket link is not valid. Check the URL or return to the ticket list."
        />
      </PageContainer>
    );
  }

  if (ticketQuery.isLoading || usersQuery.isLoading) {
    return (
      <PageContainer title="Ticket Detail" description="Loading ticket information...">
        <TicketDetailSkeleton />
      </PageContainer>
    );
  }

  if (ticketQuery.isError) {
    const isNotFound =
      ticketQuery.error instanceof ApiClientError && ticketQuery.error.statusCode === 404;

    return (
      <PageContainer
        title={isNotFound ? 'Ticket not found' : 'Unable to load ticket'}
        description={
          isNotFound
            ? 'The requested ticket does not exist or may have been removed.'
            : 'Something went wrong while loading this ticket.'
        }
      >
        <ErrorState
          title={isNotFound ? 'Ticket not found' : 'Something went wrong'}
          message={
            ticketQuery.error instanceof ApiClientError
              ? ticketQuery.error.message
              : 'Unable to load ticket details.'
          }
          onRetry={
            isNotFound
              ? undefined
              : () => {
                  void ticketQuery.refetch();
                }
          }
        />
      </PageContainer>
    );
  }

  if (!ticketQuery.data) {
    return null;
  }

  const { ticket, comments, history, allowedTransitions, permissions } = ticketQuery.data;
  const hasActions =
    permissions.canEdit || permissions.canAssign || permissions.canChangeStatus;

  return (
    <PageContainer
      title={ticket.title}
      description={`Ticket #${ticket._id.slice(-6).toUpperCase()}`}
      actions={
        permissions.canEdit ? (
          <Button render={<Link href={`/tickets/${ticket._id}/edit`} />} nativeButton={false}>
            Edit ticket
          </Button>
        ) : null
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Description</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {ticket.description}
              </p>
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Created by</dt>
                <dd className="font-medium">
                  {usersById[ticket.createdBy]?.name ?? 'Unknown user'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Assignee</dt>
                <dd className="font-medium">
                  {ticket.assignedTo
                    ? (usersById[ticket.assignedTo]?.name ?? 'Unknown user')
                    : 'Unassigned'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">{formatDateTime(ticket.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last updated</dt>
                <dd className="font-medium">{formatDateTime(ticket.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Comments</h3>
            {permissions.canComment ? <CommentForm ticketId={ticket._id} /> : null}
            <CommentTimeline comments={comments} usersById={usersById} />
          </section>
        </div>

        <aside className="space-y-6">
          {hasActions ? (
            <section className="space-y-4 rounded-xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm">
              <h3 className="text-sm font-semibold">Actions</h3>
              {permissions.canChangeStatus ? (
                <StatusSelect
                  ticketId={ticket._id}
                  currentStatus={ticket.status}
                  allowedTransitions={allowedTransitions}
                />
              ) : null}
              {permissions.canAssign ? (
                <AssignmentSelect
                  ticketId={ticket._id}
                  assignedTo={ticket.assignedTo}
                  users={usersQuery.data ?? []}
                />
              ) : null}
            </section>
          ) : null}

          <section className="space-y-4">
            <h3 className="text-lg font-semibold">History</h3>
            <HistoryTimeline history={history} usersById={usersById} />
          </section>
        </aside>
      </div>
    </PageContainer>
  );
}
