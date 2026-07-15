import Link from 'next/link';

import { EmptyState } from '@/components/common/empty-state';
import { PriorityBadge } from '@/components/tickets/priority-badge';
import { StatusBadge } from '@/components/tickets/status-badge';
import type { Ticket } from '@/types/ticket.types';

type RecentTicketsTableProps = {
  tickets: Ticket[];
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function RecentTicketsTable({ tickets }: RecentTicketsTableProps) {
  if (tickets.length === 0) {
    return (
      <EmptyState
        title="No tickets yet"
        description="Create a support ticket to see recent activity here."
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
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
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
                <td className="px-4 py-3 text-muted-foreground">{formatDate(ticket.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
