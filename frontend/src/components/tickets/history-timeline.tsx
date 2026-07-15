import {
  ArrowRightLeft,
  FileEdit,
  MessageSquare,
  TicketPlus,
  UserRound,
} from 'lucide-react';

import { EmptyState } from '@/components/common/empty-state';
import { formatDateTime } from '@/lib/format';
import { HistoryActions, type HistoryEntry } from '@/types/ticket.types';
import type { User } from '@/types/user.types';

type HistoryTimelineProps = {
  history: HistoryEntry[];
  usersById: Record<string, User>;
};

function HistoryIcon({ action }: { action: string }) {
  if (action === HistoryActions.CREATED) {
    return <TicketPlus className="size-4 text-primary" />;
  }

  if (action === HistoryActions.STATUS_CHANGED) {
    return <ArrowRightLeft className="size-4 text-primary" />;
  }

  if (action === HistoryActions.ASSIGNED) {
    return <UserRound className="size-4 text-primary" />;
  }

  if (
    action === HistoryActions.UPDATED ||
    action === HistoryActions.PRIORITY_CHANGED ||
    action === HistoryActions.DESCRIPTION_CHANGED
  ) {
    return <FileEdit className="size-4 text-primary" />;
  }

  return <MessageSquare className="size-4 text-primary" />;
}

function formatValue(value: unknown, usersById: Record<string, User>): string {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'string') {
    return usersById[value]?.name ?? value;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function getHistoryTitle(entry: HistoryEntry, usersById: Record<string, User>): string {
  const performer = usersById[entry.performedBy]?.name ?? 'Unknown user';

  switch (entry.action) {
    case HistoryActions.CREATED:
      return `${performer} created the ticket`;
    case HistoryActions.STATUS_CHANGED:
      return `${performer} changed status from ${formatValue(entry.previousValue, usersById)} to ${formatValue(entry.newValue, usersById)}`;
    case HistoryActions.ASSIGNED:
      return `${performer} updated assignment`;
    case HistoryActions.PRIORITY_CHANGED:
      return `${performer} changed priority`;
    case HistoryActions.DESCRIPTION_CHANGED:
      return `${performer} updated description`;
    case HistoryActions.UPDATED:
      return `${performer} updated the ticket`;
    default:
      return `${performer} performed ${entry.action.toLowerCase().replace(/_/g, ' ')}`;
  }
}

function getHistoryDescription(
  entry: HistoryEntry,
  usersById: Record<string, User>,
): string | undefined {
  if (entry.action === HistoryActions.ASSIGNED) {
    const from = formatValue(entry.previousValue, usersById);
    const to = formatValue(entry.newValue, usersById);
    return `From ${from} to ${to}`;
  }

  return entry.comment;
}

export function HistoryTimeline({ history, usersById }: HistoryTimelineProps) {
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime(),
  );

  if (sortedHistory.length === 0) {
    return (
      <EmptyState
        title="No history yet"
        description="Ticket audit history will appear here as changes are made."
      />
    );
  }

  return (
    <ol className="space-y-4">
      {sortedHistory.map((entry) => (
        <li key={entry._id} className="flex gap-3">
          <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <HistoryIcon action={entry.action} />
          </div>
          <div className="min-w-0 flex-1 rounded-xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{getHistoryTitle(entry, usersById)}</p>
              <time className="text-xs text-muted-foreground" dateTime={entry.performedAt}>
                {formatDateTime(entry.performedAt)}
              </time>
            </div>
            {getHistoryDescription(entry, usersById) ? (
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {getHistoryDescription(entry, usersById)}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
