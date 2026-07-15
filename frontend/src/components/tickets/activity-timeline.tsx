import { MessageSquare, RefreshCw, TicketPlus } from 'lucide-react';

import { EmptyState } from '@/components/common/empty-state';
import { formatDateTime } from '@/lib/format';
import type { ActivityEvent } from '@/lib/activity-timeline';
import type { User } from '@/types/user.types';

type ActivityTimelineProps = {
  events: ActivityEvent[];
  usersById: Record<string, User>;
};

function ActivityIcon({ type }: { type: ActivityEvent['type'] }) {
  if (type === 'created') {
    return <TicketPlus className="size-4 text-primary" />;
  }

  if (type === 'comment') {
    return <MessageSquare className="size-4 text-primary" />;
  }

  return <RefreshCw className="size-4 text-primary" />;
}

export function ActivityTimeline({ events, usersById }: ActivityTimelineProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="Ticket activity will appear here as updates are made."
      />
    );
  }

  return (
    <ol className="space-y-4">
      {events.map((event) => (
        <li key={event.id} className="flex gap-3">
          <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <ActivityIcon type={event.type} />
          </div>
          <div className="min-w-0 flex-1 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{event.title}</p>
              <time className="text-xs text-muted-foreground" dateTime={event.timestamp}>
                {formatDateTime(event.timestamp)}
              </time>
            </div>
            {event.userId ? (
              <p className="mt-1 text-xs text-muted-foreground">
                by {usersById[event.userId]?.name ?? 'Unknown user'}
              </p>
            ) : null}
            {event.description ? (
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {event.description}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
