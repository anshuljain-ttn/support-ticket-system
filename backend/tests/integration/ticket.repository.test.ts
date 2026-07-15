import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { HistoryActions } from '@/constants/permissions.js';
import { Ticket } from '@/models/ticket.model.js';
import { ticketRepository } from '@/repositories/ticket.repository.js';
import { TicketPriorities, TicketStatuses } from '@/types/ticket.types.js';

import {
  clearTestDatabase,
  seedTestUsers,
  startTestDatabase,
  type SeededUsers,
  type TestDatabase,
} from '../helpers/test-db.js';

function buildHistoryEntry(createdBy: string) {
  return {
    action: HistoryActions.CREATED,
    performedBy: createdBy,
    performedAt: new Date(),
    previousValue: null,
    newValue: { status: TicketStatuses.OPEN },
  };
}

describe('ticket model and repository', () => {
  let testDb: TestDatabase;
  let users: SeededUsers;

  beforeAll(async () => {
    testDb = await startTestDatabase();
  });

  beforeEach(async () => {
    users = await seedTestUsers();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await testDb.stop();
  });

  it('creates ticket model indexes', async () => {
    const indexes = await Ticket.collection.getIndexes();

    expect(indexes).toHaveProperty('status_1_createdAt_-1');
    expect(indexes).toHaveProperty('priority_1');
    expect(indexes).toHaveProperty('assignedTo_1');
    expect(indexes).toHaveProperty('createdBy_1');
    expect(indexes).toHaveProperty('title_text_description_text');
  });

  it('creates and retrieves a ticket', async () => {
    const created = await ticketRepository.create(
      {
        title: 'VPN not working',
        description: 'Unable to connect to corporate VPN from home network.',
        priority: TicketPriorities.HIGH,
        createdBy: users.employeeId,
        lastUpdatedBy: users.employeeId,
      },
      buildHistoryEntry(users.employeeId),
    );

    const found = await ticketRepository.findById(created._id.toString());

    expect(found).not.toBeNull();
    expect(found?.status).toBe(TicketStatuses.OPEN);
    expect(found?.title).toBe('VPN not working');
  });

  it('updates a ticket', async () => {
    const created = await ticketRepository.create(
      {
        title: 'Printer issue',
        description: 'Office printer on floor 3 is not responding to jobs.',
        priority: TicketPriorities.MEDIUM,
        createdBy: users.employeeId,
        lastUpdatedBy: users.employeeId,
      },
      buildHistoryEntry(users.employeeId),
    );

    const updated = await ticketRepository.updateById(created._id.toString(), {
      status: TicketStatuses.IN_PROGRESS,
      assignedTo: users.adminId,
    });

    expect(updated?.status).toBe(TicketStatuses.IN_PROGRESS);
    expect(updated?.assignedTo?.toString()).toBe(users.adminId);
  });

  it('filters and paginates tickets', async () => {
    await ticketRepository.create(
      {
        title: 'Open ticket alpha',
        description: 'First open ticket for filter testing.',
        priority: TicketPriorities.LOW,
        createdBy: users.employeeId,
        lastUpdatedBy: users.employeeId,
      },
      buildHistoryEntry(users.employeeId),
    );

    await ticketRepository.create(
      {
        title: 'Resolved ticket beta',
        description: 'Resolved ticket for filter testing.',
        priority: TicketPriorities.HIGH,
        createdBy: users.employeeId,
        lastUpdatedBy: users.employeeId,
        status: TicketStatuses.RESOLVED,
      },
      buildHistoryEntry(users.employeeId),
    );

    const result = await ticketRepository.findWithQuery({
      status: [TicketStatuses.OPEN],
      page: 1,
      limit: 10,
      sort: 'newest',
    });

    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.status).toBe(TicketStatuses.OPEN);
  });

  it('sorts tickets by priority rank', async () => {
    await ticketRepository.create(
      {
        title: 'Low priority ticket',
        description: 'Low priority ticket for sorting test.',
        priority: TicketPriorities.LOW,
        createdBy: users.employeeId,
        lastUpdatedBy: users.employeeId,
      },
      buildHistoryEntry(users.employeeId),
    );

    await ticketRepository.create(
      {
        title: 'Critical priority ticket',
        description: 'Critical priority ticket for sorting test.',
        priority: TicketPriorities.CRITICAL,
        createdBy: users.employeeId,
        lastUpdatedBy: users.employeeId,
      },
      buildHistoryEntry(users.employeeId),
    );

    const result = await ticketRepository.findWithQuery({
      sort: 'priority',
      page: 1,
      limit: 10,
    });

    expect(result.items[0]?.priority).toBe(TicketPriorities.CRITICAL);
    expect(result.items[1]?.priority).toBe(TicketPriorities.LOW);
  });
});
