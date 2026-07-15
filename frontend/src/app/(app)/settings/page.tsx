'use client';

import { ThemeToggle } from '@/components/common/theme-toggle';
import { PageContainer } from '@/components/layout/page-container';

export default function SettingsPage() {
  return (
    <PageContainer title="Settings" description="Customize your application experience.">
      <div className="max-w-2xl">
        <section className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold">Appearance</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Switch between light, dark, or system theme.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
