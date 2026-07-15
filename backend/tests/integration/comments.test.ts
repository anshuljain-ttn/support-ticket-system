import { Types } from 'mongoose';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ErrorCodes } from '@/constants/error-codes.js';
import { createTestApp, createTicketViaApi } from '../helpers/test-app.js';
import {
  clearTestDatabase,
  seedTestUsers,
  startTestDatabase,
  type SeededUsers,
  type TestDatabase,
} from '../helpers/test-db.js';
import { TicketPriorities } from '@/types/ticket.types.js';

describe('comments REST API', () => {
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

  it('POST /tickets/:id/comments creates a comment', async () => {
    const app = createTestApp();
    const ticketId = await createTicketViaApi(app, users.employeeId, {
      title: 'Printer issue',
      description: 'Office printer is not responding to jobs.',
      priority: TicketPriorities.MEDIUM,
    });

    const response = await request(app).post(`/tickets/${ticketId}/comments`).send({
      message: 'Checked the printer queue.',
      createdBy: users.employeeId,
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        ticketId,
        message: 'Checked the printer queue.',
        createdBy: users.employeeId,
        createdAt: expect.any(String) as string,
      },
    });
  });

  it('comments appear in ticket detail sorted by createdAt asc', async () => {
    const app = createTestApp();
    const ticketId = await createTicketViaApi(app, users.employeeId);

    await request(app).post(`/tickets/${ticketId}/comments`).send({
      message: 'First comment',
      createdBy: users.employeeId,
    });

    await request(app).post(`/tickets/${ticketId}/comments`).send({
      message: 'Second comment',
      createdBy: users.employeeId,
    });

    const response = await request(app).get(`/tickets/${ticketId}`);

    expect(response.status).toBe(200);
    const comments = (response.body as { data: { comments: { message: string }[] } }).data
      .comments;
    expect(comments).toHaveLength(2);
    expect(comments[0]?.message).toBe('First comment');
    expect(comments[1]?.message).toBe('Second comment');
  });

  it('POST /tickets/:id/comments returns 404 for non-existent ticket', async () => {
    const app = createTestApp();
    const missingId = new Types.ObjectId().toString();

    const response = await request(app).post(`/tickets/${missingId}/comments`).send({
      message: 'This should fail.',
      createdBy: users.employeeId,
    });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: ErrorCodes.TICKET_NOT_FOUND,
      },
    });
  });

  it('POST /tickets/:id/comments returns 400 for empty message', async () => {
    const app = createTestApp();
    const ticketId = await createTicketViaApi(app, users.employeeId);

    const response = await request(app).post(`/tickets/${ticketId}/comments`).send({
      message: '   ',
      createdBy: users.employeeId,
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
      },
    });
  });
});
