import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Plus, Ticket } from 'lucide-react';

import { cn } from '@/lib/utils';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

export const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    match: (pathname) => pathname === '/',
  },
  {
    href: '/tickets',
    label: 'Tickets',
    icon: Ticket,
    match: (pathname) =>
      pathname === '/tickets' ||
      /^\/tickets\/[^/]+(\/edit)?$/.test(pathname),
  },
  {
    href: '/tickets/new',
    label: 'New Ticket',
    icon: Plus,
    match: (pathname) => pathname === '/tickets/new',
  },
];

type SidebarProps = {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
};

export function Sidebar({ pathname, onNavigate, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        className,
      )}
    >
      <div className="border-b border-sidebar-border px-4 py-5">
        <Link href="/" className="block" onClick={onNavigate}>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Support Desk
          </p>
          <p className="mt-1 text-sm font-semibold">Ticket Management</p>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = item.match(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
