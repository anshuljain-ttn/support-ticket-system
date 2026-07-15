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

import { TicketPriorities } from '@/types/ticket.types.js';

let mongoServer: MongoMemoryServer;
let employeeId: string;

describe('comments REST API', () => {
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

  async function createTicket(app: ReturnType<typeof createApp>) {
    const response = await request(app).post('/tickets').send({
      title: 'Printer issue',
      description: 'Office printer is not responding to jobs.',
      priority: TicketPriorities.MEDIUM,
      createdBy: employeeId,
    });

    return (response.body as { data: { _id: string } }).data._id;
  }

  it('POST /tickets/:id/comments creates a comment', async () => {
    const app = createApp();
    const ticketId = await createTicket(app);

    const response = await request(app).post(`/tickets/${ticketId}/comments`).send({
      message: 'Checked the printer queue.',
      createdBy: employeeId,
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        ticketId,
        message: 'Checked the printer queue.',
        createdBy: employeeId,
        createdAt: expect.any(String) as string,
      },
    });
  });

  it('comments appear in ticket detail sorted by createdAt asc', async () => {
    const app = createApp();
    const ticketId = await createTicket(app);

    await request(app).post(`/tickets/${ticketId}/comments`).send({
      message: 'First comment',
      createdBy: employeeId,
    });

    await request(app).post(`/tickets/${ticketId}/comments`).send({
      message: 'Second comment',
      createdBy: employeeId,
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
    const app = createApp();
    const missingId = new Types.ObjectId().toString();

    const response = await request(app).post(`/tickets/${missingId}/comments`).send({
      message: 'This should fail.',
      createdBy: employeeId,
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
    const app = createApp();
    const ticketId = await createTicket(app);

    const response = await request(app).post(`/tickets/${ticketId}/comments`).send({
      message: '   ',
      createdBy: employeeId,
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
