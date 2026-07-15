import Link from 'next/link';

import { EmptyState } from '@/components/common/empty-state';
import { PriorityBadge } from '@/components/tickets/priority-badge';
import { StatusBadge } from '@/components/tickets/status-badge';
import { formatShortDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Ticket } from '@/types/ticket.types';
import type { User } from '@/types/user.types';

type TicketTableProps = {
  tickets: Ticket[];
  usersById: Record<string, User>;
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function TicketTable({
  tickets,
  usersById,
  className,
  emptyTitle = 'No tickets found',
  emptyDescription = 'Try adjusting your filters or create a new support ticket.',
}: TicketTableProps) {
  if (tickets.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={
          <Link
            href="/tickets/new"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Create ticket
          </Link>
        }
      />
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Assignee</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {tickets.map((ticket) => (
              <tr key={ticket._id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">
                  <Link
                    href={`/tickets/${ticket._id}`}
                    className="text-foreground hover:text-primary hover:underline"
                  >
                    {ticket.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {ticket.assignedTo
                    ? (usersById[ticket.assignedTo]?.name ?? 'Unknown user')
                    : 'Unassigned'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatShortDate(ticket.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function buildUsersById(users: User[]): Record<string, User> {
  return users.reduce<Record<string, User>>((acc, user) => {
    acc[user._id] = user;
    return acc;
  }, {});
}
