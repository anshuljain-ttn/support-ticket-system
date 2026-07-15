import { EmptyState } from '@/components/common/empty-state';
import { formatDateTime } from '@/lib/format';
import type { Comment } from '@/types/ticket.types';
import type { User } from '@/types/user.types';

type CommentTimelineProps = {
  comments: Comment[];
  usersById: Record<string, User>;
};

export function CommentTimeline({ comments, usersById }: CommentTimelineProps) {
  if (comments.length === 0) {
    return (
      <EmptyState
        title="No comments yet"
        description="Be the first to add an update on this ticket."
      />
    );
  }

  const sortedComments = [...comments].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );

  return (
    <ol className="space-y-4">
      {sortedComments.map((comment) => (
        <li key={comment._id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {usersById[comment.createdBy]?.name ?? 'Unknown user'}
            </p>
            <time className="text-xs text-muted-foreground" dateTime={comment.createdAt}>
              {formatDateTime(comment.createdAt)}
            </time>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{comment.message}</p>
        </li>
      ))}
    </ol>
  );
}
