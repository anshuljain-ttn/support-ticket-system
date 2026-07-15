'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { PageContainer } from '@/components/layout/page-container';
import { TicketForm } from '@/components/tickets/ticket-form';
import { useCreateTicket } from '@/hooks/use-tickets';
import { ApiClientError } from '@/services/api-client';
import { createTicketFormSchema, type CreateTicketFormValues } from '@/schemas/ticket.schema';

export function CreateTicketView() {
  const router = useRouter();
  const createTicket = useCreateTicket();

  const handleSubmit = async (values: CreateTicketFormValues) => {
    try {
      const parsed = createTicketFormSchema.parse(values);
      const ticket = await createTicket.mutateAsync({
        title: parsed.title,
        description: parsed.description,
        priority: parsed.priority,
      });

      toast.success('Ticket created successfully');
      router.push(`/tickets/${ticket._id}`);
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Unable to create ticket.';
      toast.error(message);
    }
  };

  return (
    <PageContainer
      title="Create Ticket"
      description="Submit a new support request. An admin will review and assign it."
    >
      <TicketForm
        mode="create"
        isSubmitting={createTicket.isPending}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
