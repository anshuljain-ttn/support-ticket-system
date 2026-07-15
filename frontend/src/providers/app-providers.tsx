'use client';

import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from '@/components/ui/sonner';

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      {children}
      <Toaster />
    </QueryProvider>
  );
}
