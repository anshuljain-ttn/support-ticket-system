import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ErrorCodes } from '@/constants/error-codes.js';
import { commentRepository } from '@/repositories/comment.repository.js';
import { ticketService } from '@/services/ticket.service.js';
import { userService } from '@/services/user.service.js';
import { TicketPriorities, TicketStatuses } from '@/types/ticket.types.js';
import type { UserRecord } from '@/types/user.types.js';

import {
  clearTestDatabase,
  seedTestUsers,
  startTestDatabase,
  type SeededUsers,
  type TestDatabase,
} from '../helpers/test-db.js';

describe('ticket service', () => {
  let testDb: TestDatabase;
  let users: SeededUsers;
  let employee: UserRecord;
  let admin: UserRecord;

  beforeAll(async () => {
    testDb = await startTestDatabase();
  });

  beforeEach(async () => {
    users = await seedTestUsers();
    employee = (await userService.getUserById(users.employeeId))!;
    admin = (await userService.getUserById(users.adminId))!;
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await testDb.stop();
  });

  it('creates a ticket with Open status', async () => {
    const ticket = await ticketService.createTicket(employee, {
      title: 'VPN issue',
      description: 'Unable to connect to corporate VPN from home.',
      priority: TicketPriorities.HIGH,
    });

    expect(ticket.status).toBe(TicketStatuses.OPEN);
    expect(ticket.createdBy).toBe(users.employeeId);
  });

  it('returns ticket detail with comments and allowed transitions', async () => {
    const created = await ticketService.createTicket(employee, {
      title: 'Printer issue',
      description: 'Office printer is not responding to jobs.',
      priority: TicketPriorities.MEDIUM,
    });

    await commentRepository.create({
      ticketId: created._id,
      message: 'Checked the printer queue.',
      createdBy: users.employeeId,
    });

    const detail = await ticketService.getTicketById(employee, created._id);

    expect(detail.ticket._id).toBe(created._id);
    expect(detail.comments).toHaveLength(1);
    expect(detail.allowedTransitions).toEqual([TicketStatuses.CANCELLED]);
  });

  it('updates ticket status via updateStatus', async () => {
    const created = await ticketService.createTicket(employee, {
      title: 'Email outage',
      description: 'Users cannot send external emails today.',
      priority: TicketPriorities.CRITICAL,
    });

    const updated = await ticketService.updateStatus(
      admin,
      created._id,
      TicketStatuses.IN_PROGRESS,
    );

    expect(updated.status).toBe(TicketStatuses.IN_PROGRESS);
  });

  it('rejects invalid status transitions', async () => {
    const created = await ticketService.createTicket(employee, {
      title: 'Badge access',
      description: 'Employee badge stopped working at the entrance.',
      priority: TicketPriorities.LOW,
    });

    await expect(
      ticketService.updateStatus(admin, created._id, TicketStatuses.RESOLVED),
    ).rejects.toMatchObject({
      code: ErrorCodes.INVALID_STATUS_TRANSITION,
    });
  });

  it('lists and searches tickets', async () => {
    const created = await ticketService.createTicket(employee, {
      title: 'Unique printer keyword',
      description: 'Printer jam on floor 2 near reception area.',
      priority: TicketPriorities.HIGH,
    });

    const list = await ticketService.listTickets(employee, { page: 1, limit: 10, sort: 'newest' });
    expect(list.items).toHaveLength(1);

    await commentRepository.create({
      ticketId: created._id,
      message: 'Found paper stuck in unique printer keyword tray.',
      createdBy: users.employeeId,
    });

    const search = await ticketService.searchTickets(employee, {
      q: 'unique printer keyword',
      page: 1,
      limit: 10,
      sort: 'newest',
    });

    expect(search.items.some((ticket) => ticket._id === created._id)).toBe(true);
  });

  it('returns dashboard stats by status', async () => {
    await ticketService.createTicket(employee, {
      title: 'Open issue',
      description: 'An open issue for stats testing.',
      priority: TicketPriorities.LOW,
    });

    const stats = await ticketService.getStats(employee);
    expect(stats[TicketStatuses.OPEN]).toBe(1);
    expect(stats[TicketStatuses.CLOSED]).toBe(0);
  });
});
