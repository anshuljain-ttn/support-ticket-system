import { Suspense } from 'react';

import { TicketListView } from '@/components/tickets/ticket-list-view';
import { TicketTableSkeleton } from '@/components/common/loading-skeleton';
import { PageContainer } from '@/components/layout/page-container';

function TicketListFallback() {
  return (
    <PageContainer
      title="Tickets"
      description="Browse, filter, and search support tickets."
    >
      <TicketTableSkeleton rows={10} />
    </PageContainer>
  );
}

export default function TicketListPage() {
  return (
    <Suspense fallback={<TicketListFallback />}>
      <TicketListView />
    </Suspense>
  );
}
