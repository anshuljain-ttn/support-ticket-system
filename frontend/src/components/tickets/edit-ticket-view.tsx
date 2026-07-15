'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageContainer } from '@/components/layout/page-container';
import { TicketForm } from '@/components/tickets/ticket-form';
import { Button } from '@/components/ui/button';
import { useTicket, useUpdateTicket } from '@/hooks/use-ticket';
import { isValidObjectId } from '@/lib/object-id';
import { ApiClientError } from '@/services/api-client';
import type { UpdateTicketFormValues } from '@/schemas/ticket.schema';

type EditTicketViewProps = {
  ticketId: string;
};

export function EditTicketView({ ticketId }: EditTicketViewProps) {
  const router = useRouter();
  const ticketQuery = useTicket(ticketId);
  const updateTicket = useUpdateTicket(ticketId);

  const handleSubmit = async (values: UpdateTicketFormValues) => {
    try {
      await updateTicket.mutateAsync(values);
      toast.success('Ticket updated successfully');
      router.push(`/tickets/${ticketId}`);
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Unable to update ticket.';
      toast.error(message);
    }
  };

  if (!isValidObjectId(ticketId)) {
    return (
      <PageContainer title="Ticket not found" description="The ticket id in the URL is invalid.">
        <ErrorState
          title="Invalid ticket"
          message="This ticket link is not valid. Check the URL or return to the ticket list."
        />
      </PageContainer>
    );
  }

  if (ticketQuery.isLoading) {
    return (
      <PageContainer title="Edit Ticket" description="Loading ticket details...">
        <LoadingSkeleton rows={6} />
      </PageContainer>
    );
  }

  if (ticketQuery.isError) {
    const isNotFound =
      ticketQuery.error instanceof ApiClientError && ticketQuery.error.statusCode === 404;

    return (
      <PageContainer
        title={isNotFound ? 'Ticket not found' : 'Unable to load ticket'}
        description="The ticket could not be loaded for editing."
      >
        <ErrorState
          title={isNotFound ? 'Ticket not found' : 'Something went wrong'}
          message={
            ticketQuery.error instanceof ApiClientError
              ? ticketQuery.error.message
              : 'Unable to load ticket details.'
          }
          onRetry={
            isNotFound
              ? undefined
              : () => {
                  void ticketQuery.refetch();
                }
          }
        />
      </PageContainer>
    );
  }

  if (!ticketQuery.data) {
    return null;
  }

  const { ticket } = ticketQuery.data;

  return (
    <PageContainer
      title="Edit Ticket"
      description={`Update details for "${ticket.title}".`}
      actions={
        <Button
          variant="outline"
          render={<Link href={`/tickets/${ticket._id}`} />}
          nativeButton={false}
        >
          Cancel
        </Button>
      }
    >
      <TicketForm
        mode="edit"
        users={[]}
        defaultValues={{
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
        }}
        isSubmitting={updateTicket.isPending}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
