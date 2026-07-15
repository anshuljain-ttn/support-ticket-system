import { TicketDetailView } from '@/components/tickets/ticket-detail-view';

type TicketDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;

  return <TicketDetailView ticketId={id} />;
}
