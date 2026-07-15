'use client';

import { toast } from 'sonner';

import { useAssignTicket } from '@/hooks/use-ticket';
import { filterAssignableUsers } from '@/lib/users';
import { ApiClientError } from '@/services/api-client';
import type { User } from '@/types/user.types';

const selectClassName =
  'h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

type AssignmentSelectProps = {
  ticketId: string;
  assignedTo: string | null;
  users: User[];
  disabled?: boolean;
};

export function AssignmentSelect({
  ticketId,
  assignedTo,
  users,
  disabled = false,
}: AssignmentSelectProps) {
  const assignTicket = useAssignTicket(ticketId);
  const assignableUsers = filterAssignableUsers(users);

  const handleChange = async (value: string) => {
    const nextAssignee = value || null;

    if (nextAssignee === assignedTo) {
      return;
    }

    try {
      await assignTicket.mutateAsync({ assignedTo: nextAssignee });
      toast.success(nextAssignee ? 'Ticket assigned' : 'Ticket unassigned');
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Unable to update assignment.';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="ticket-assignee" className="text-sm font-medium">
        Assignee
      </label>
      <select
        id="ticket-assignee"
        className={selectClassName}
        value={assignedTo ?? ''}
        disabled={disabled || assignTicket.isPending}
        onChange={(event) => {
          void handleChange(event.target.value);
        }}
      >
        <option value="">Unassigned</option>
        {assignableUsers.map((user) => (
          <option key={user._id} value={user._id}>
            {user.name} ({user.role})
          </option>
        ))}
      </select>
    </div>
  );
}
