import { Types } from 'mongoose';

import { HistoryActions } from '@/constants/permissions.js';
import type { TicketDocument } from '@/models/ticket.model.js';
import { ticketRepository } from '@/repositories/ticket.repository.js';
import type { HistoryEntry, HistoryEntryInput } from '@/types/ticket.types.js';

export const auditService = {
  buildEntry(input: HistoryEntryInput): HistoryEntry {
    return {
      _id: new Types.ObjectId().toString(),
      action: input.action,
      performedBy: input.performedBy,
      performedAt: new Date().toISOString(),
      previousValue: input.previousValue,
      newValue: input.newValue,
      comment: input.comment,
    };
  },

  async appendHistory(ticketId: string, entry: HistoryEntryInput): Promise<void> {
    const historyEntry = this.buildEntry(entry);
    await ticketRepository.pushHistory(ticketId, {
      action: historyEntry.action,
      performedBy: historyEntry.performedBy,
      performedAt: new Date(historyEntry.performedAt),
      previousValue: historyEntry.previousValue,
      newValue: historyEntry.newValue,
      comment: historyEntry.comment,
    });
  },

  buildCreatedEntry(createdBy: string): HistoryEntryInput {
    return {
      action: HistoryActions.CREATED,
      performedBy: createdBy,
      previousValue: null,
      newValue: { status: 'Open' },
    };
  },

  buildStatusChangeEntry(
    performedBy: string,
    previousStatus: string,
    newStatus: string,
  ): HistoryEntryInput {
    return {
      action: HistoryActions.STATUS_CHANGED,
      performedBy,
      previousValue: previousStatus,
      newValue: newStatus,
    };
  },

  buildAssignmentEntry(
    performedBy: string,
    previousAssignee: string | null,
    newAssignee: string | null,
  ): HistoryEntryInput {
    return {
      action: HistoryActions.ASSIGNED,
      performedBy,
      previousValue: previousAssignee,
      newValue: newAssignee,
    };
  },

  buildFieldChangeEntry(
    action: typeof HistoryActions.UPDATED | typeof HistoryActions.PRIORITY_CHANGED | typeof HistoryActions.DESCRIPTION_CHANGED,
    performedBy: string,
    previousValue: unknown,
    newValue: unknown,
  ): HistoryEntryInput {
    return {
      action,
      performedBy,
      previousValue,
      newValue,
    };
  },

  toHistoryDtoList(ticket: TicketDocument): HistoryEntry[] {
    return (ticket.history ?? []).map((entry) => ({
      _id: entry._id.toString(),
      action: entry.action,
      performedBy: entry.performedBy.toString(),
      performedAt: entry.performedAt.toISOString(),
      previousValue: entry.previousValue,
      newValue: entry.newValue,
      comment: entry.comment ?? undefined,
    }));
  },
};
