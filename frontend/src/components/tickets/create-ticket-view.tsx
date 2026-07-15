'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { toast } from 'sonner';

import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageContainer } from '@/components/layout/page-container';
import { TicketForm } from '@/components/tickets/ticket-form';
import { useCreateTicket } from '@/hooks/use-tickets';
import { useUsers } from '@/hooks/use-users';
import { ApiClientError } from '@/services/api-client';
import { createTicketFormSchema, type CreateTicketFormValues } from '@/schemas/ticket.schema';
import { UserRoles } from '@/types/user.types';

export function CreateTicketView() {
  const router = useRouter();
  const createTicket = useCreateTicket();
  const usersQuery = useUsers();

  const defaultCreatedBy = useMemo(() => {
    const users = usersQuery.data ?? [];
    return users.find((user) => user.role === UserRoles.EMPLOYEE)?._id ?? users[0]?._id ?? '';
  }, [usersQuery.data]);

  const handleSubmit = async (values: CreateTicketFormValues) => {
    try {
      const parsed = createTicketFormSchema.parse(values);
      const ticket = await createTicket.mutateAsync({
        title: parsed.title,
        description: parsed.description,
        priority: parsed.priority,
        createdBy: parsed.createdBy,
        assignedTo: parsed.assignedTo ?? null,
      });

      toast.success('Ticket created successfully');
      router.push(`/tickets/${ticket._id}`);
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Unable to create ticket.';
      toast.error(message);
    }
  };

  if (usersQuery.isLoading) {
    return (
      <PageContainer
        title="Create Ticket"
        description="Submit a new support request for the team."
      >
        <LoadingSkeleton rows={6} />
      </PageContainer>
    );
  }

  if (usersQuery.isError) {
    return (
      <PageContainer
        title="Create Ticket"
        description="Submit a new support request for the team."
      >
        <ErrorState
          message="Unable to load users for the ticket form."
          onRetry={() => {
            void usersQuery.refetch();
          }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Create Ticket"
      description="Submit a new support request for the team."
    >
      <TicketForm
        mode="create"
        users={usersQuery.data ?? []}
        defaultValues={{ createdBy: defaultCreatedBy }}
        isSubmitting={createTicket.isPending}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
