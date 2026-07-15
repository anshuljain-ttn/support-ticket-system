import { Types } from 'mongoose';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ErrorCodes } from '@/constants/error-codes.js';
import {
  buildCreateTicketPayload,
  createTestApp,
  createTicketViaApi,
  expectValidationError,
  loginViaApi,
} from '../helpers/test-app.js';
import {
  clearTestDatabase,
  seedTestUsers,
  startTestDatabase,
  type SeededUsers,
  type TestDatabase,
} from '../helpers/test-db.js';

describe('API validation integration', () => {
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

  it('AC-8.1: missing title on create returns 400 with field detail', async () => {
    const app = createTestApp();
    const employeeAgent = await loginViaApi(app, users.employeeEmail);
    const { title: _title, ...payload } = buildCreateTicketPayload();
    const response = await employeeAgent.post('/tickets').send(payload);

    expectValidationError(response, 'title');
  });

  it('AC-8.2: missing description on create returns 400', async () => {
    const app = createTestApp();
    const employeeAgent = await loginViaApi(app, users.employeeEmail);
    const { description: _description, ...payload } = buildCreateTicketPayload();
    const response = await employeeAgent.post('/tickets').send(payload);

    expectValidationError(response, 'description');
  });

  it('AC-8.3: title shorter than 3 characters returns 400', async () => {
    const app = createTestApp();
    const employeeAgent = await loginViaApi(app, users.employeeEmail);
    const response = await employeeAgent
      .post('/tickets')
      .send(buildCreateTicketPayload({ title: 'ab' }));

    expectValidationError(response, 'title');
  });

  it('AC-8.4: title longer than 200 characters returns 400', async () => {
    const app = createTestApp();
    const employeeAgent = await loginViaApi(app, users.employeeEmail);
    const response = await employeeAgent
      .post('/tickets')
      .send(buildCreateTicketPayload({ title: 'a'.repeat(201) }));

    expectValidationError(response, 'title');
  });

  it('AC-8.5: description shorter than 10 characters returns 400', async () => {
    const app = createTestApp();
    const employeeAgent = await loginViaApi(app, users.employeeEmail);
    const response = await employeeAgent
      .post('/tickets')
      .send(buildCreateTicketPayload({ description: 'short' }));

    expectValidationError(response, 'description');
  });

  it('AC-8.6: invalid priority enum returns 400', async () => {
    const app = createTestApp();
    const employeeAgent = await loginViaApi(app, users.employeeEmail);
    const response = await employeeAgent
      .post('/tickets')
      .send(buildCreateTicketPayload({ priority: 'Urgent' as never }));

    expectValidationError(response, 'priority');
  });

  it('AC-8.7: unknown createdBy field returns 400 validation error', async () => {
    const app = createTestApp();
    const employeeAgent = await loginViaApi(app, users.employeeEmail);
    const response = await employeeAgent
      .post('/tickets')
      .send({ ...buildCreateTicketPayload(), createdBy: users.employeeId });

    expectValidationError(response);
  });

  it('AC-8.8: non-existent assignedTo on assign returns 400 USER_NOT_FOUND', async () => {
    const app = createTestApp();
    const adminAgent = await loginViaApi(app, users.adminEmail);
    const employeeAgent = await loginViaApi(app, users.employeeEmail);
    const ticketId = await createTicketViaApi(employeeAgent);
    const missingUserId = new Types.ObjectId().toString();

    const response = await adminAgent
      .patch(`/tickets/${ticketId}/assign`)
      .send({ assignedTo: missingUserId });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.USER_NOT_FOUND },
    });
  });

  it('AC-8.8b: assigning ticket to employee returns 400 validation error', async () => {
    const app = createTestApp();
    const adminAgent = await loginViaApi(app, users.adminEmail);
    const employeeAgent = await loginViaApi(app, users.employeeEmail);
    const ticketId = await createTicketViaApi(employeeAgent);

    const response = await adminAgent
      .patch(`/tickets/${ticketId}/assign`)
      .send({ assignedTo: users.employeeId });

    expectValidationError(response, 'assignedTo');
  });

  it('AC-8.9: malformed ticket id returns 400 with id field detail', async () => {
    const app = createTestApp();
    const employeeAgent = await loginViaApi(app, users.employeeEmail);
    const response = await employeeAgent.get('/tickets/not-a-valid-id');

    expectValidationError(response, 'id');
  });

  it('AC-8.10: empty comment message returns 400', async () => {
    const app = createTestApp();
    const employeeAgent = await loginViaApi(app, users.employeeEmail);
    const ticketId = await createTicketViaApi(employeeAgent);
    const response = await employeeAgent.post(`/tickets/${ticketId}/comments`).send({
      message: '   ',
    });

    expectValidationError(response, 'message');
  });

  it('AC-8.11: validation errors include details array with field and message', async () => {
    const app = createTestApp();
    const employeeAgent = await loginViaApi(app, users.employeeEmail);
    const response = await employeeAgent
      .post('/tickets')
      .send(buildCreateTicketPayload({ title: 'ab' }));

    expectValidationError(response, 'title');
    const details = (response.body as { error: { details: { field: string; message: string }[] } })
      .error.details;
    expect(details[0]).toMatchObject({
      field: expect.any(String) as string,
      message: expect.any(String) as string,
    });
  });
});
