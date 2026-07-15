type TicketDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;

  return (
    <main className="flex flex-1 flex-col p-8">
      <h1 className="text-2xl font-semibold">Ticket Detail</h1>
      <p className="mt-2 text-muted-foreground">Ticket {id} — implementation in progress</p>
    </main>
  );
}
