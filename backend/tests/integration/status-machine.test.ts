import type { Agent } from 'supertest';
import type { Application } from 'express';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ErrorCodes } from '@/constants/error-codes.js';
import {
  createTestApp,
  createTicketViaApi,
  loginViaApi,
  patchTicketStatus,
  putTicket,
} from '../helpers/test-app.js';
import {
  clearTestDatabase,
  seedTestUsers,
  startTestDatabase,
  type SeededUsers,
  type TestDatabase,
} from '../helpers/test-db.js';
import { TicketStatuses } from '@/types/ticket.types.js';

describe('status machine integration', () => {
  let testDb: TestDatabase;
  let users: SeededUsers;
  let app: Application;
  let employeeAgent: Agent;
  let adminAgent: Agent;

  beforeAll(async () => {
    testDb = await startTestDatabase();
  });

  beforeEach(async () => {
    users = await seedTestUsers();
    app = createTestApp();
    employeeAgent = await loginViaApi(app, users.employeeEmail);
    adminAgent = await loginViaApi(app, users.adminEmail);
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await testDb.stop();
  });

  async function createOpenTicket() {
    const ticketId = await createTicketViaApi(employeeAgent);
    return { ticketId };
  }

  async function moveTicketToInProgress(ticketId: string) {
    const response = await patchTicketStatus(adminAgent, ticketId, TicketStatuses.IN_PROGRESS);
    expect(response.status).toBe(200);
  }

  async function moveTicketToResolved(ticketId: string) {
    await moveTicketToInProgress(ticketId);
    const response = await patchTicketStatus(adminAgent, ticketId, TicketStatuses.RESOLVED);
    expect(response.status).toBe(200);
  }

  async function moveTicketToClosed(ticketId: string) {
    await moveTicketToResolved(ticketId);
    const response = await patchTicketStatus(adminAgent, ticketId, TicketStatuses.CLOSED);
    expect(response.status).toBe(200);
  }

  it('AC-5.1: Open -> In Progress succeeds via PATCH', async () => {
    const { ticketId } = await createOpenTicket();
    const response = await patchTicketStatus(adminAgent, ticketId, TicketStatuses.IN_PROGRESS);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: TicketStatuses.IN_PROGRESS },
    });
  });

  it('AC-5.2: Open -> Resolved fails via PATCH', async () => {
    const { ticketId } = await createOpenTicket();
    const response = await patchTicketStatus(adminAgent, ticketId, TicketStatuses.RESOLVED);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.INVALID_STATUS_TRANSITION },
    });
  });

  it('AC-5.3: In Progress -> Resolved succeeds via PATCH', async () => {
    const { ticketId } = await createOpenTicket();
    await moveTicketToInProgress(ticketId);

    const response = await patchTicketStatus(adminAgent, ticketId, TicketStatuses.RESOLVED);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: TicketStatuses.RESOLVED },
    });
  });

  it('AC-5.4: Resolved -> Closed succeeds via PATCH', async () => {
    const { ticketId } = await createOpenTicket();
    await moveTicketToResolved(ticketId);

    const response = await patchTicketStatus(adminAgent, ticketId, TicketStatuses.CLOSED);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: TicketStatuses.CLOSED },
    });
  });

  it('AC-5.5: Closed -> Open fails via PATCH', async () => {
    const { ticketId } = await createOpenTicket();
    await moveTicketToClosed(ticketId);

    const response = await patchTicketStatus(adminAgent, ticketId, TicketStatuses.OPEN);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.INVALID_STATUS_TRANSITION },
    });
  });

  it('AC-5.6: Open -> Cancelled succeeds via PATCH', async () => {
    const { ticketId } = await createOpenTicket();
    const response = await patchTicketStatus(employeeAgent, ticketId, TicketStatuses.CANCELLED);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: TicketStatuses.CANCELLED },
    });
  });

  it('AC-5.7: In Progress -> Cancelled succeeds via PATCH', async () => {
    const { ticketId } = await createOpenTicket();
    await moveTicketToInProgress(ticketId);

    const response = await patchTicketStatus(adminAgent, ticketId, TicketStatuses.CANCELLED);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: TicketStatuses.CANCELLED },
    });
  });

  it('AC-5.8: Resolved -> Cancelled fails via PATCH', async () => {
    const { ticketId } = await createOpenTicket();
    await moveTicketToResolved(ticketId);

    const response = await patchTicketStatus(adminAgent, ticketId, TicketStatuses.CANCELLED);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.INVALID_STATUS_TRANSITION },
    });
  });

  it('AC-5.9: Resolved -> In Progress fails via PATCH', async () => {
    const { ticketId } = await createOpenTicket();
    await moveTicketToResolved(ticketId);

    const response = await patchTicketStatus(adminAgent, ticketId, TicketStatuses.IN_PROGRESS);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.INVALID_STATUS_TRANSITION },
    });
  });

  it('AC-5.10: Closed -> Cancelled fails via PATCH', async () => {
    const { ticketId } = await createOpenTicket();
    await moveTicketToClosed(ticketId);

    const response = await patchTicketStatus(adminAgent, ticketId, TicketStatuses.CANCELLED);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.INVALID_STATUS_TRANSITION },
    });
  });

  it('AC-5.12: PUT rejects status field in body', async () => {
    const { ticketId } = await createOpenTicket();
    const response = await putTicket(employeeAgent, ticketId, { status: TicketStatuses.RESOLVED });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.VALIDATION_ERROR },
    });
  });

  it('AC-5.12: PUT allows valid field updates', async () => {
    const { ticketId } = await createOpenTicket();
    const response = await putTicket(employeeAgent, ticketId, { title: 'Updated badge access title' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { title: 'Updated badge access title' },
    });
  });
});
