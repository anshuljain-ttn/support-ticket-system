'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useAddComment } from '@/hooks/use-comments';
import { ApiClientError } from '@/services/api-client';
import { createCommentFormSchema, type CreateCommentFormValues } from '@/schemas/comment.schema';
import type { User } from '@/types/user.types';
import { UserRoles } from '@/types/user.types';

const inputClassName =
  'h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive';

const textareaClassName =
  'min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive';

type CommentFormProps = {
  ticketId: string;
  users: User[];
};

export function CommentForm({ ticketId, users }: CommentFormProps) {
  const addComment = useAddComment(ticketId);

  const defaultCreatedBy = useMemo(() => {
    return users.find((user) => user.role === UserRoles.EMPLOYEE)?._id ?? users[0]?._id ?? '';
  }, [users]);

  const form = useForm<CreateCommentFormValues>({
    resolver: zodResolver(createCommentFormSchema),
    defaultValues: {
      message: '',
      createdBy: defaultCreatedBy,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  return (
    <form
      className="space-y-4 rounded-xl border border-border bg-card p-4"
      onSubmit={handleSubmit(async (values) => {
        try {
          await addComment.mutateAsync(values);
          reset({ message: '', createdBy: values.createdBy });
          toast.success('Comment added');
        } catch (error) {
          const message =
            error instanceof ApiClientError ? error.message : 'Unable to add comment.';
          toast.error(message);
        }
      })}
      noValidate
    >
      <div className="space-y-2">
        <label htmlFor="comment-message" className="text-sm font-medium">
          Add comment
        </label>
        <textarea
          id="comment-message"
          className={textareaClassName}
          placeholder="Write an update..."
          aria-invalid={Boolean(errors.message)}
          {...register('message')}
        />
        {errors.message?.message ? (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="comment-createdBy" className="text-sm font-medium">
          Comment as
        </label>
        <select
          id="comment-createdBy"
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
        {errors.createdBy?.message ? (
          <p className="text-sm text-destructive">{errors.createdBy.message}</p>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={addComment.isPending}>
          {addComment.isPending ? 'Posting...' : 'Post comment'}
        </Button>
      </div>
    </form>
  );
}
