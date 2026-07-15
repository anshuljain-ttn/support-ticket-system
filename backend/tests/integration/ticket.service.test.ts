import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types } from 'mongoose';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ErrorCodes } from '@/constants/error-codes.js';
import { Comment } from '@/models/comment.model.js';
import { Ticket } from '@/models/ticket.model.js';
import { commentRepository } from '@/repositories/comment.repository.js';
import { ticketRepository } from '@/repositories/ticket.repository.js';
import { userRepository } from '@/repositories/user.repository.js';
import { ticketService } from '@/services/ticket.service.js';
import { userService } from '@/services/user.service.js';

import { TicketPriorities, TicketStatuses } from '@/types/ticket.types.js';

let mongoServer: MongoMemoryServer;
let employeeId: string;

describe('ticket service', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await Promise.all([Ticket.syncIndexes(), Comment.syncIndexes()]);
  });

  beforeEach(async () => {
    await userService.seedUsers();
    const users = await userRepository.findAll();
    employeeId = users[0]?._id.toString() ?? '';
  });

  afterEach(async () => {
    await commentRepository.deleteAll();
    await ticketRepository.deleteAll();
    await userRepository.deleteAll();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('creates a ticket with Open status', async () => {
    const ticket = await ticketService.createTicket({
      title: 'VPN issue',
      description: 'Unable to connect to corporate VPN from home.',
      priority: TicketPriorities.HIGH,
      createdBy: employeeId,
    });

    expect(ticket.status).toBe(TicketStatuses.OPEN);
    expect(ticket.createdBy).toBe(employeeId);
  });

  it('returns ticket detail with comments and allowed transitions', async () => {
    const created = await ticketService.createTicket({
      title: 'Printer issue',
      description: 'Office printer is not responding to jobs.',
      priority: TicketPriorities.MEDIUM,
      createdBy: employeeId,
    });

    await commentRepository.create({
      ticketId: created._id,
      message: 'Checked the printer queue.',
      createdBy: employeeId,
    });

    const detail = await ticketService.getTicketById(created._id);

    expect(detail.ticket._id).toBe(created._id);
    expect(detail.comments).toHaveLength(1);
    expect(detail.allowedTransitions).toEqual([
      TicketStatuses.IN_PROGRESS,
      TicketStatuses.CANCELLED,
    ]);
  });

  it('updates ticket status via updateStatus', async () => {
    const created = await ticketService.createTicket({
      title: 'Email outage',
      description: 'Users cannot send external emails today.',
      priority: TicketPriorities.CRITICAL,
      createdBy: employeeId,
    });

    const updated = await ticketService.updateStatus(
      created._id,
      TicketStatuses.IN_PROGRESS,
    );

    expect(updated.status).toBe(TicketStatuses.IN_PROGRESS);
  });

  it('rejects invalid status transitions', async () => {
    const created = await ticketService.createTicket({
      title: 'Badge access',
      description: 'Employee badge stopped working at the entrance.',
      priority: TicketPriorities.LOW,
      createdBy: employeeId,
    });

    await expect(
      ticketService.updateStatus(created._id, TicketStatuses.RESOLVED),
    ).rejects.toMatchObject({
      code: ErrorCodes.INVALID_STATUS_TRANSITION,
    });
  });

  it('lists and searches tickets', async () => {
    const created = await ticketService.createTicket({
      title: 'Unique printer keyword',
      description: 'Printer jam on floor 2 near reception area.',
      priority: TicketPriorities.HIGH,
      createdBy: employeeId,
    });

    const list = await ticketService.listTickets({ page: 1, limit: 10, sort: 'newest' });
    expect(list.items).toHaveLength(1);

    await commentRepository.create({
      ticketId: created._id,
      message: 'Found paper stuck in unique printer keyword tray.',
      createdBy: employeeId,
    });

    const search = await ticketService.searchTickets({
      q: 'unique printer keyword',
      page: 1,
      limit: 10,
      sort: 'newest',
    });

    expect(search.items.some((ticket) => ticket._id === created._id)).toBe(true);
  });

  it('returns dashboard stats by status', async () => {
    await ticketService.createTicket({
      title: 'Open issue',
      description: 'An open issue for stats testing.',
      priority: TicketPriorities.LOW,
      createdBy: employeeId,
    });

    const stats = await ticketService.getStats();
    expect(stats[TicketStatuses.OPEN]).toBe(1);
    expect(stats[TicketStatuses.CLOSED]).toBe(0);
  });

  it('rejects ticket creation with unknown user', async () => {
    await expect(
      ticketService.createTicket({
        title: 'Unknown user ticket',
        description: 'This should fail because user does not exist.',
        priority: TicketPriorities.LOW,
        createdBy: new Types.ObjectId().toString(),
      }),
    ).rejects.toMatchObject({
      code: ErrorCodes.USER_NOT_FOUND,
    });
  });
});
