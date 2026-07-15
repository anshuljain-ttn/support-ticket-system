import { StatusBadge } from '@/components/tickets/status-badge';
import { ALL_TICKET_STATUSES } from '@/lib/status-transitions';
import type { TicketStats } from '@/types/ticket.types';

type StatsCardsProps = {
  stats: TicketStats;
};

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {ALL_TICKET_STATUSES.map((status) => (
        <div key={status} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <StatusBadge status={status} />
          <p className="mt-4 text-3xl font-semibold tracking-tight">{stats[status]}</p>
          <p className="mt-1 text-sm text-muted-foreground">tickets</p>
        </div>
      ))}
    </div>
  );
}
