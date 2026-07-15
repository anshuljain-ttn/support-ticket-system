import { EditTicketView } from '@/components/tickets/edit-ticket-view';

type EditTicketPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTicketPage({ params }: EditTicketPageProps) {
  const { id } = await params;

  return <EditTicketView ticketId={id} />;
}
