import { PageContainer } from '@/components/layout/page-container';

type TicketDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;

  return (
    <PageContainer
      title="Ticket Detail"
      description={`Viewing ticket ${id}.`}
    >
      <p className="text-muted-foreground">Ticket detail — implementation in progress.</p>
    </PageContainer>
  );
}
