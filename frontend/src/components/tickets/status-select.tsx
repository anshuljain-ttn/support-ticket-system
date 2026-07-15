'use client';

import { toast } from 'sonner';

import { StatusBadge } from '@/components/tickets/status-badge';
import { useUpdateTicketStatus } from '@/hooks/use-ticket';
import { ApiClientError } from '@/services/api-client';
import type { TicketStatus } from '@/types/ticket.types';

const selectClassName =
  'h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

type StatusSelectProps = {
  ticketId: string;
  currentStatus: TicketStatus;
  allowedTransitions: TicketStatus[];
};

export function StatusSelect({ ticketId, currentStatus, allowedTransitions }: StatusSelectProps) {
  const updateStatus = useUpdateTicketStatus(ticketId);

  const options = [currentStatus, ...allowedTransitions.filter((status) => status !== currentStatus)];

  const handleChange = async (nextStatus: TicketStatus) => {
    if (nextStatus === currentStatus) {
      return;
    }

    try {
      await updateStatus.mutateAsync(nextStatus);
      toast.success(`Status updated to ${nextStatus}`);
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Unable to update ticket status.';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="ticket-status" className="text-sm font-medium">
          Status
        </label>
        <StatusBadge status={currentStatus} />
      </div>
      <select
        id="ticket-status"
        className={selectClassName}
        value={currentStatus}
        disabled={updateStatus.isPending || allowedTransitions.length === 0}
        onChange={(event) => {
          void handleChange(event.target.value as TicketStatus);
        }}
      >
        {options.map((status) => (
          <option key={status} value={status}>
            {status}
            {status === currentStatus ? ' (current)' : ''}
          </option>
        ))}
      </select>
      {allowedTransitions.length === 0 ? (
        <p className="text-xs text-muted-foreground">No further status transitions available.</p>
      ) : null}
    </div>
  );
}
