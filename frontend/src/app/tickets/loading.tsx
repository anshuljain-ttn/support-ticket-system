import { TicketTableSkeleton } from '@/components/common/loading-skeleton';
import { PageContainer } from '@/components/layout/page-container';

export default function TicketsLoading() {
  return (
    <PageContainer title="Tickets" description="Loading ticket list...">
      <TicketTableSkeleton rows={8} />
    </PageContainer>
  );
}
