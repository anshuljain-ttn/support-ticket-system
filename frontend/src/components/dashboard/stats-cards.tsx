import type { DashboardStats } from '@/types/ticket.types';
import { UserRoles } from '@/types/user.types';

type StatCardConfig = {
  key: string;
  label: string;
  description?: string;
};

const employeeStats: StatCardConfig[] = [
  { key: 'myOpen', label: 'My Open', description: 'Open tickets you created' },
  { key: 'myInProgress', label: 'In Progress', description: 'Tickets currently in progress' },
  { key: 'myResolved', label: 'Resolved', description: 'Resolved tickets' },
  { key: 'myClosed', label: 'Closed', description: 'Closed tickets' },
  { key: 'myCancelled', label: 'Cancelled', description: 'Cancelled tickets' },
];

const adminStats: StatCardConfig[] = [
  { key: 'createdByMe', label: 'Created by Me' },
  { key: 'assignedToMe', label: 'Assigned to Me' },
  { key: 'waitingForAction', label: 'Waiting for Action' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

const superAdminStats: StatCardConfig[] = [
  { key: 'users', label: 'Total Users' },
  { key: 'employees', label: 'Employees' },
  { key: 'admins', label: 'Admins' },
  { key: 'open', label: 'Open' },
  { key: 'inProgress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'averageResolutionHours', label: 'Avg Resolution (hrs)' },
];

function getStatCards(role: string): StatCardConfig[] {
  if (role === UserRoles.EMPLOYEE) {
    return employeeStats;
  }

  if (role === UserRoles.ADMIN) {
    return adminStats;
  }

  return superAdminStats;
}

type StatsCardsProps = {
  dashboard: DashboardStats;
};

export function StatsCards({ dashboard }: StatsCardsProps) {
  const cards = getStatCards(dashboard.role);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {cards.map((card) => {
        const value = dashboard.stats[card.key] ?? 0;
        const displayValue =
          card.key === 'averageResolutionHours' && typeof value === 'number'
            ? value.toFixed(1)
            : value;

        return (
          <div
            key={card.key}
            className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm backdrop-blur-sm"
          >
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{displayValue}</p>
            {card.description ? (
              <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
