import Link from 'next/link';

import { EmptyState } from '@/components/common/empty-state';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <PageContainer
      title="Page not found"
      description="The page you requested does not exist."
    >
      <EmptyState
        title="404 — Not found"
        description="Check the URL or navigate back to a known page in the application."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button render={<Link href="/" />} nativeButton={false}>
              Go to dashboard
            </Button>
            <Button variant="outline" render={<Link href="/tickets" />} nativeButton={false}>
              View tickets
            </Button>
          </div>
        }
      />
    </PageContainer>
  );
}
