type EditTicketPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTicketPage({ params }: EditTicketPageProps) {
  const { id } = await params;

  return (
    <main className="flex flex-1 flex-col p-8">
      <h1 className="text-2xl font-semibold">Edit Ticket</h1>
      <p className="mt-2 text-muted-foreground">Edit ticket {id} — implementation in progress</p>
    </main>
  );
}
