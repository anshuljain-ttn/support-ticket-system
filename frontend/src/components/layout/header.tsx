'use client';

import { Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

type HeaderProps = {
  title?: string;
  onMenuToggle: () => void;
  isMenuOpen: boolean;
};

export function Header({ title = 'Support Ticket Management', onMenuToggle, isMenuOpen }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
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
    </header>
  );
}
