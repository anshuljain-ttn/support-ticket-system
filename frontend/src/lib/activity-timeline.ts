import type { Comment, Ticket } from '@/types/ticket.types';

export type ActivityEventType = 'created' | 'comment' | 'updated';

export type ActivityEvent = {
  id: string;
  type: ActivityEventType;
  timestamp: string;
  title: string;
  description?: string;
  userId?: string;
};

export function buildActivityEvents(ticket: Ticket, comments: Comment[]): ActivityEvent[] {
  const events: ActivityEvent[] = [
    {
      id: 'created',
      type: 'created',
      timestamp: ticket.createdAt,
      title: 'Ticket created',
      userId: ticket.createdBy,
    },
  ];

  for (const comment of comments) {
    events.push({
      id: comment._id,
      type: 'comment',
      timestamp: comment.createdAt,
      title: 'Comment added',
      description: comment.message,
      userId: comment.createdBy,
    });
  }

  const createdAt = new Date(ticket.createdAt).getTime();
  const updatedAt = new Date(ticket.updatedAt).getTime();

  if (updatedAt - createdAt > 1000) {
    const assignmentLabel = ticket.assignedTo ? 'assigned' : 'unassigned';

    events.push({
      id: 'updated',
      type: 'updated',
      timestamp: ticket.updatedAt,
      title: 'Ticket updated',
      description: `Current status: ${ticket.status}, ${assignmentLabel}`,
    });
  }

  return events.sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
}
