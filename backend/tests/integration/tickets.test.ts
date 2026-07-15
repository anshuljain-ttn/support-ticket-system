import { Types } from 'mongoose';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ErrorCodes } from '@/constants/error-codes.js';
import { commentRepository } from '@/repositories/comment.repository.js';
import {
  createTestApp,
  createTicketViaApi,
  patchTicketStatus,
} from '../helpers/test-app.js';
import {
  clearTestDatabase,
  seedTestUsers,
  startTestDatabase,
  type SeededUsers,
  type TestDatabase,
} from '../helpers/test-db.js';
import { TicketPriorities, TicketStatuses } from '@/types/ticket.types.js';

describe('tickets REST API', () => {
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

  it('POST /tickets creates a ticket with Open status', async () => {
    const app = createTestApp();
    const response = await request(app).post('/tickets').send({
      title: 'VPN issue',
      description: 'Unable to connect to corporate VPN from home.',
      priority: TicketPriorities.HIGH,
      createdBy: users.employeeId,
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        title: 'VPN issue',
        status: TicketStatuses.OPEN,
        createdBy: users.employeeId,
        createdAt: expect.any(String) as string,
        updatedAt: expect.any(String) as string,
      },
    });
  });

  it('GET /tickets/:id returns ticket with comments and allowed transitions', async () => {
    const app = createTestApp();
    const ticketId = await createTicketViaApi(app, users.employeeId, {
      title: 'Printer issue',
      description: 'Office printer is not responding to jobs.',
      priority: TicketPriorities.MEDIUM,
    });

    await commentRepository.create({
      ticketId,
      message: 'Checked the printer queue.',
      createdBy: users.employeeId,
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
            createdBy: users.employeeId,
          },
        ],
        allowedTransitions: [TicketStatuses.IN_PROGRESS, TicketStatuses.CANCELLED],
      },
    });
  });

  it('PUT /tickets/:id updates ticket fields', async () => {
    const app = createTestApp();
    const ticketId = await createTicketViaApi(app, users.employeeId, {
      title: 'Email outage',
      description: 'Users cannot send external emails today.',
      priority: TicketPriorities.CRITICAL,
    });

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
    const app = createTestApp();
    const ticketId = await createTicketViaApi(app, users.employeeId, {
      title: 'Badge access',
      description: 'Employee badge stopped working at the entrance.',
      priority: TicketPriorities.LOW,
    });

    const response = await patchTicketStatus(app, ticketId, TicketStatuses.IN_PROGRESS);

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
    const app = createTestApp();
    await createTicketViaApi(app, users.employeeId, {
      title: 'First ticket',
      description: 'First ticket for pagination testing.',
      priority: TicketPriorities.LOW,
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
    const app = createTestApp();
    const ticketId = await createTicketViaApi(app, users.employeeId, {
      title: 'Unique printer keyword',
      description: 'Printer jam on floor 2 near reception area.',
      priority: TicketPriorities.HIGH,
    });

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
    const app = createTestApp();
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
