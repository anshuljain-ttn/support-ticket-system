'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) {
    return <div className={cn('h-8 w-[7.5rem] rounded-lg bg-muted/50', className)} />;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-border/60 bg-background/60 p-1 backdrop-blur-sm',
        className,
      )}
    >
      {themes.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          size="sm"
          variant={theme === value ? 'secondary' : 'ghost'}
          className="h-7 px-2"
          onClick={() => setTheme(value)}
          aria-label={`Use ${label.toLowerCase()} theme`}
          aria-pressed={theme === value}
        >
          <Icon className="size-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}
