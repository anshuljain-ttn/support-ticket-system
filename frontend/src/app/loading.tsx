import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageContainer } from '@/components/layout/page-container';

export default function Loading() {
  return (
    <PageContainer title="Loading" description="Please wait while the page loads.">
      <LoadingSkeleton rows={6} />
    </PageContainer>
  );
}
