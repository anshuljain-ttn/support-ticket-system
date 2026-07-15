'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Header } from '@/components/layout/header';
import { navItems, Sidebar } from '@/components/layout/sidebar';
import { cn } from '@/lib/utils';

type AppShellProps = {
  children: React.ReactNode;
};

function getPageTitle(pathname: string): string {
  const matchedItem = navItems.find((item) => item.match(pathname));
  return matchedItem?.label ?? 'Support Ticket Management';
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileNav, setMobileNav] = useState<{ open: boolean; path: string | null }>({
    open: false,
    path: null,
  });
  const isMobileNavOpen = mobileNav.open && mobileNav.path === pathname;

  useEffect(() => {
    if (!isMobileNavOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileNavOpen]);

  function closeMobileNav() {
    setMobileNav({ open: false, path: null });
  }

  function toggleMobileNav() {
    if (isMobileNavOpen) {
      closeMobileNav();
      return;
    }

    setMobileNav({ open: true, path: pathname });
  }

  return (
    <div className="flex min-h-full flex-1 bg-background">
      <div className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">
          <Sidebar pathname={pathname} />
        </div>
      </div>

      {isMobileNavOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={closeMobileNav}
        />
      ) : null}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200 lg:hidden',
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar pathname={pathname} onNavigate={closeMobileNav} className="shadow-xl" />
      </div>

      <div className="flex min-h-full flex-1 flex-col lg:pl-64">
        <Header
          title={getPageTitle(pathname)}
          isMenuOpen={isMobileNavOpen}
          onMenuToggle={toggleMobileNav}
        />
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
