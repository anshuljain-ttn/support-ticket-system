import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TicketPriority } from '@/types/ticket.types';
import { TicketPriorities } from '@/types/ticket.types';

const priorityStyles: Record<TicketPriority, string> = {
  [TicketPriorities.LOW]: 'border-slate-200 bg-slate-50 text-slate-700',
  [TicketPriorities.MEDIUM]: 'border-blue-200 bg-blue-50 text-blue-800',
  [TicketPriorities.HIGH]: 'border-orange-200 bg-orange-50 text-orange-900',
  [TicketPriorities.CRITICAL]: 'border-red-200 bg-red-50 text-red-800',
};

type PriorityBadgeProps = {
  priority: TicketPriority;
  className?: string;
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge variant="outline" className={cn(priorityStyles[priority], className)}>
      {priority}
    </Badge>
  );
}
