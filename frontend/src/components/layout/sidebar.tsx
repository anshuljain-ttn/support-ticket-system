import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Plus, Settings, Ticket, User } from 'lucide-react';

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
      pathname === '/tickets' || /^\/tickets\/[^/]+(\/edit)?$/.test(pathname),
  },
  {
    href: '/tickets/new',
    label: 'New Ticket',
    icon: Plus,
    match: (pathname) => pathname === '/tickets/new',
  },
];

export const secondaryNavItems: NavItem[] = [
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
    match: (pathname) => pathname === '/profile',
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    match: (pathname) => pathname === '/settings',
  },
];

type SidebarProps = {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
  className?: string;
};

function NavLink({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const isActive = item.match(pathname);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
        collapsed && 'justify-center px-2',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed ? <span>{item.label}</span> : null}
    </Link>
  );
}

export function Sidebar({
  pathname,
  collapsed = false,
  onNavigate,
  onToggleCollapse,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-sidebar-border/60 bg-sidebar/80 text-sidebar-foreground backdrop-blur-xl',
        className,
      )}
    >
      <div className="border-b border-sidebar-border/60 px-4 py-5">
        <Link href="/" className="block" onClick={onNavigate}>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {collapsed ? 'SD' : 'Support Desk'}
          </p>
          {!collapsed ? (
            <p className="mt-1 text-sm font-semibold">Ticket Management</p>
          ) : null}
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="space-y-1 border-t border-sidebar-border/60 p-3">
        {secondaryNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
              collapsed && 'justify-center px-2',
            )}
          >
            {collapsed ? '→' : '← Collapse'}
          </button>
        ) : null}
      </div>
    </aside>
  );
}
