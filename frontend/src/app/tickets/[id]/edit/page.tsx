import { PageContainer } from '@/components/layout/page-container';

type EditTicketPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTicketPage({ params }: EditTicketPageProps) {
  const { id } = await params;

  return (
    <PageContainer
      title="Edit Ticket"
      description={`Update ticket ${id}.`}
    >
      <p className="text-muted-foreground">Edit ticket form — implementation in progress.</p>
    </PageContainer>
  );
}
