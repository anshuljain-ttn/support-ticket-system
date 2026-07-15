import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types } from 'mongoose';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '@/app.js';
import { ErrorCodes } from '@/constants/error-codes.js';
import { Comment } from '@/models/comment.model.js';
import { Ticket } from '@/models/ticket.model.js';
import { commentRepository } from '@/repositories/comment.repository.js';
import { ticketRepository } from '@/repositories/ticket.repository.js';
import { userRepository } from '@/repositories/user.repository.js';
import { userService } from '@/services/user.service.js';

import { TicketPriorities, TicketStatuses } from '@/types/ticket.types.js';

let mongoServer: MongoMemoryServer;
let employeeId: string;

describe('tickets REST API', () => {
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

  it('POST /tickets creates a ticket with Open status', async () => {
    const app = createApp();
    const response = await request(app).post('/tickets').send({
      title: 'VPN issue',
      description: 'Unable to connect to corporate VPN from home.',
      priority: TicketPriorities.HIGH,
      createdBy: employeeId,
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        title: 'VPN issue',
        status: TicketStatuses.OPEN,
        createdBy: employeeId,
        createdAt: expect.any(String) as string,
        updatedAt: expect.any(String) as string,
      },
    });
  });

  it('GET /tickets/:id returns ticket with comments and allowed transitions', async () => {
    const app = createApp();
    const created = await request(app).post('/tickets').send({
      title: 'Printer issue',
      description: 'Office printer is not responding to jobs.',
      priority: TicketPriorities.MEDIUM,
      createdBy: employeeId,
    });

    const ticketId = (created.body as { data: { _id: string } }).data._id;

    await commentRepository.create({
      ticketId,
      message: 'Checked the printer queue.',
      createdBy: employeeId,
    });

    const response = await request(app).get(`/tickets/${ticketId}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        ticket: {
          _id: ticketId,
          status: TicketStatuses.OPEN,
        },
        comments: [
          {
            message: 'Checked the printer queue.',
            createdBy: employeeId,
          },
        ],
        allowedTransitions: [TicketStatuses.IN_PROGRESS, TicketStatuses.CANCELLED],
      },
    });
  });

  it('PUT /tickets/:id updates ticket fields', async () => {
    const app = createApp();
    const created = await request(app).post('/tickets').send({
      title: 'Email outage',
      description: 'Users cannot send external emails today.',
      priority: TicketPriorities.CRITICAL,
      createdBy: employeeId,
    });

    const ticketId = (created.body as { data: { _id: string } }).data._id;

    const response = await request(app).put(`/tickets/${ticketId}`).send({
      title: 'Email outage resolved',
      priority: TicketPriorities.HIGH,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        _id: ticketId,
        title: 'Email outage resolved',
        priority: TicketPriorities.HIGH,
      },
    });
  });

  it('PATCH /tickets/:id/status updates status only', async () => {
    const app = createApp();
    const created = await request(app).post('/tickets').send({
      title: 'Badge access',
      description: 'Employee badge stopped working at the entrance.',
      priority: TicketPriorities.LOW,
      createdBy: employeeId,
    });

    const ticketId = (created.body as { data: { _id: string } }).data._id;

    const response = await request(app)
      .patch(`/tickets/${ticketId}/status`)
      .send({ status: TicketStatuses.IN_PROGRESS });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        _id: ticketId,
        status: TicketStatuses.IN_PROGRESS,
      },
    });
  });

  it('GET /tickets returns paginated list', async () => {
    const app = createApp();
    await request(app).post('/tickets').send({
      title: 'First ticket',
      description: 'First ticket for pagination testing.',
      priority: TicketPriorities.LOW,
      createdBy: employeeId,
    });

    const response = await request(app).get('/tickets?page=1&limit=10');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        items: expect.any(Array) as unknown[],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      },
    });
  });

  it('GET /tickets/search finds tickets by keyword', async () => {
    const app = createApp();
    const created = await request(app).post('/tickets').send({
      title: 'Unique printer keyword',
      description: 'Printer jam on floor 2 near reception area.',
      priority: TicketPriorities.HIGH,
      createdBy: employeeId,
    });

    const ticketId = (created.body as { data: { _id: string } }).data._id;

    const response = await request(app).get('/tickets/search').query({
      q: 'unique printer keyword',
      page: 1,
      limit: 10,
    });

    expect(response.status).toBe(200);
    const items = (response.body as { data: { items: { _id: string }[] } }).data.items;
    expect(items.some((ticket) => ticket._id === ticketId)).toBe(true);
  });

  it('GET /tickets/:id returns 404 for non-existent ticket', async () => {
    const app = createApp();
    const missingId = new Types.ObjectId().toString();

    const response = await request(app).get(`/tickets/${missingId}`);

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: ErrorCodes.TICKET_NOT_FOUND,
      },
    });
  });
});
