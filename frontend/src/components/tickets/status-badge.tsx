import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TicketStatus } from '@/types/ticket.types';
import { TicketStatuses } from '@/types/ticket.types';

const statusStyles: Record<TicketStatus, string> = {
  [TicketStatuses.OPEN]: 'border-sky-200 bg-sky-50 text-sky-800',
  [TicketStatuses.IN_PROGRESS]: 'border-amber-200 bg-amber-50 text-amber-900',
  [TicketStatuses.RESOLVED]: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  [TicketStatuses.CLOSED]: 'border-slate-200 bg-slate-100 text-slate-700',
  [TicketStatuses.CANCELLED]: 'border-rose-200 bg-rose-50 text-rose-800',
};

type StatusBadgeProps = {
  status: TicketStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(statusStyles[status], className)}>
      {status}
    </Badge>
  );
}
