'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ALL_TICKET_STATUSES } from '@/lib/status-transitions';
import { cn } from '@/lib/utils';
import type { TicketSearchParams, TicketSortOption } from '@/types/ticket.types';
import { TicketPriorities } from '@/types/ticket.types';
import type { User } from '@/types/user.types';

const SORT_OPTIONS: { value: TicketSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'priority', label: 'Priority' },
];

type TicketFiltersProps = {
  params: TicketSearchParams;
  users: User[];
  onApply: (updates: Partial<TicketSearchParams>) => void;
  onReset: () => void;
  className?: string;
};

function toggleValue<T extends string>(values: T[] | undefined, value: T): T[] {
  const current = values ?? [];

  if (current.includes(value)) {
    return current.filter((item) => item !== value);
  }

  return [...current, value];
}

export function TicketFilters({ params, users, onApply, onReset, className }: TicketFiltersProps) {
  return (
    <div className={cn('space-y-4 rounded-xl border border-border bg-card p-4', className)}>
      <SearchField
        key={params.q ?? ''}
        initialQuery={params.q}
        onSearch={(query) => {
          onApply({ q: query || undefined });
        }}
        onReset={onReset}
      />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <FilterGroup label="Status">
          {ALL_TICKET_STATUSES.map((status) => (
            <label key={status} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={params.status?.includes(status) ?? false}
                onChange={() => {
                  onApply({ status: toggleValue(params.status, status) });
                }}
                className="size-4 rounded border-input"
              />
              <span>{status}</span>
            </label>
          ))}
        </FilterGroup>

        <FilterGroup label="Priority">
          {Object.values(TicketPriorities).map((priority) => (
            <label key={priority} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={params.priority?.includes(priority) ?? false}
                onChange={() => {
                  onApply({ priority: toggleValue(params.priority, priority) });
                }}
                className="size-4 rounded border-input"
              />
              <span>{priority}</span>
            </label>
          ))}
        </FilterGroup>

        <div className="space-y-2">
          <p className="text-sm font-medium">Assignee</p>
          <select
            value={params.assignedTo ?? ''}
            onChange={(event) => {
              onApply({ assignedTo: event.target.value || undefined });
            }}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">All assignees</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Sort by</p>
          <select
            value={params.sort ?? 'newest'}
            onChange={(event) => {
              onApply({ sort: event.target.value as TicketSortOption });
            }}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function SearchField({
  initialQuery,
  onSearch,
  onReset,
}: {
  initialQuery?: string;
  onSearch: (query: string) => void;
  onReset: () => void;
}) {
  const [searchInput, setSearchInput] = useState(initialQuery ?? '');

  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onSearch(searchInput.trim());
            }
          }}
          placeholder="Search tickets..."
          className="h-9 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => {
            onSearch(searchInput.trim());
          }}
        >
          Search
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}
