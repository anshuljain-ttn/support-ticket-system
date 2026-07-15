'use client';

import { Menu, X } from 'lucide-react';

import { ThemeToggle } from '@/components/common/theme-toggle';
import { UserMenu } from '@/components/common/user-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type HeaderProps = {
  title?: string;
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  className?: string;
};

export function Header({
  title = 'Support Ticket Management',
  onMenuToggle,
  isMenuOpen,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl lg:px-6',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
        <h1 className="text-base font-semibold sm:text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle className="hidden sm:flex" />
        <UserMenu />
      </div>
    </header>
  );
}
