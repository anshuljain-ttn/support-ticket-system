import type { Types } from 'mongoose';

type TicketOwnershipRef = {
  createdBy: Types.ObjectId | string;
};

export function isTicketOwner(ticket: TicketOwnershipRef, userId: string): boolean {
  return ticket.createdBy.toString() === userId;
}
