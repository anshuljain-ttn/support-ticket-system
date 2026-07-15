'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  createTicketFormSchema,
  updateTicketFormSchema,
  type CreateTicketFormValues,
  type UpdateTicketFormValues,
} from '@/schemas/ticket.schema';
import { TicketPriorities } from '@/types/ticket.types';
import type { User } from '@/types/user.types';

const inputClassName =
  'h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive';

const textareaClassName =
  'min-h-32 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive';

type TicketFormBaseProps = {
  users: User[];
  isSubmitting?: boolean;
  className?: string;
};

type CreateTicketFormProps = TicketFormBaseProps & {
  mode: 'create';
  defaultValues?: Partial<CreateTicketFormValues>;
  onSubmit: (values: CreateTicketFormValues) => Promise<void>;
};

type EditTicketFormProps = TicketFormBaseProps & {
  mode: 'edit';
  defaultValues: UpdateTicketFormValues;
  onSubmit: (values: UpdateTicketFormValues) => Promise<void>;
};

export type TicketFormProps = CreateTicketFormProps | EditTicketFormProps;

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

export function TicketForm(props: TicketFormProps) {
  if (props.mode === 'create') {
    return <CreateTicketForm {...props} />;
  }

  return <EditTicketForm {...props} />;
}

function CreateTicketForm({
  users,
  defaultValues,
  isSubmitting = false,
  onSubmit,
  className,
}: CreateTicketFormProps) {
  const form = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium',
      createdBy: defaultValues?.createdBy ?? '',
      assignedTo: defaultValues?.assignedTo ?? '',
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form
      className={cn('space-y-6 rounded-xl border border-border bg-card p-6', className)}
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      noValidate
    >
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          type="text"
          className={inputClassName}
          aria-invalid={Boolean(errors.title)}
          {...register('title')}
        />
        <FieldError message={errors.title?.message} />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          className={textareaClassName}
          aria-invalid={Boolean(errors.description)}
          {...register('description')}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="priority" className="text-sm font-medium">
            Priority
          </label>
          <select
            id="priority"
            className={inputClassName}
            aria-invalid={Boolean(errors.priority)}
            {...register('priority')}
          >
            {Object.values(TicketPriorities).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <FieldError message={errors.priority?.message} />
        </div>

        <div className="space-y-2">
          <label htmlFor="createdBy" className="text-sm font-medium">
            Created by
          </label>
          <select
            id="createdBy"
            className={inputClassName}
            aria-invalid={Boolean(errors.createdBy)}
            {...register('createdBy')}
          >
            <option value="">Select user</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
          <FieldError message={errors.createdBy?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="assignedTo" className="text-sm font-medium">
          Assignee (optional)
        </label>
        <select id="assignedTo" className={inputClassName} {...register('assignedTo')}>
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
        <FieldError message={errors.assignedTo?.message} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create ticket'}
        </Button>
      </div>
    </form>
  );
}

function EditTicketForm({
  defaultValues,
  isSubmitting = false,
  onSubmit,
  className,
}: EditTicketFormProps) {
  const form = useForm<UpdateTicketFormValues>({
    resolver: zodResolver(updateTicketFormSchema),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form
      className={cn('space-y-6 rounded-xl border border-border bg-card p-6', className)}
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      noValidate
    >
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          type="text"
          className={inputClassName}
          aria-invalid={Boolean(errors.title)}
          {...register('title')}
        />
        <FieldError message={errors.title?.message} />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          className={textareaClassName}
          aria-invalid={Boolean(errors.description)}
          {...register('description')}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="space-y-2">
        <label htmlFor="priority" className="text-sm font-medium">
          Priority
        </label>
        <select
          id="priority"
          className={inputClassName}
          aria-invalid={Boolean(errors.priority)}
          {...register('priority')}
        >
          {Object.values(TicketPriorities).map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <FieldError message={errors.priority?.message} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
