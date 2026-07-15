import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ErrorCodes } from '@/constants/error-codes.js';
import {
  createTestApp,
  createTicketViaApi,
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

  async function createOpenTicket() {
    const app = createTestApp();
    const ticketId = await createTicketViaApi(app, users.employeeId);
    return { app, ticketId };
  }

  async function moveTicketToInProgress(app: ReturnType<typeof createTestApp>, ticketId: string) {
    const response = await patchTicketStatus(app, ticketId, TicketStatuses.IN_PROGRESS);
    expect(response.status).toBe(200);
  }

  async function moveTicketToResolved(app: ReturnType<typeof createTestApp>, ticketId: string) {
    await moveTicketToInProgress(app, ticketId);
    const response = await patchTicketStatus(app, ticketId, TicketStatuses.RESOLVED);
    expect(response.status).toBe(200);
  }

  async function moveTicketToClosed(app: ReturnType<typeof createTestApp>, ticketId: string) {
    await moveTicketToResolved(app, ticketId);
    const response = await patchTicketStatus(app, ticketId, TicketStatuses.CLOSED);
    expect(response.status).toBe(200);
  }

  it('AC-5.1: Open -> In Progress succeeds via PATCH', async () => {
    const { app, ticketId } = await createOpenTicket();
    const response = await patchTicketStatus(app, ticketId, TicketStatuses.IN_PROGRESS);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: TicketStatuses.IN_PROGRESS },
    });
  });

  it('AC-5.2: Open -> Resolved fails via PATCH', async () => {
    const { app, ticketId } = await createOpenTicket();
    const response = await patchTicketStatus(app, ticketId, TicketStatuses.RESOLVED);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.INVALID_STATUS_TRANSITION },
    });
  });

  it('AC-5.3: In Progress -> Resolved succeeds via PATCH', async () => {
    const { app, ticketId } = await createOpenTicket();
    await moveTicketToInProgress(app, ticketId);

    const response = await patchTicketStatus(app, ticketId, TicketStatuses.RESOLVED);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: TicketStatuses.RESOLVED },
    });
  });

  it('AC-5.4: Resolved -> Closed succeeds via PATCH', async () => {
    const { app, ticketId } = await createOpenTicket();
    await moveTicketToResolved(app, ticketId);

    const response = await patchTicketStatus(app, ticketId, TicketStatuses.CLOSED);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: TicketStatuses.CLOSED },
    });
  });

  it('AC-5.5: Closed -> Open fails via PATCH', async () => {
    const { app, ticketId } = await createOpenTicket();
    await moveTicketToClosed(app, ticketId);

    const response = await patchTicketStatus(app, ticketId, TicketStatuses.OPEN);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.INVALID_STATUS_TRANSITION },
    });
  });

  it('AC-5.6: Open -> Cancelled succeeds via PATCH', async () => {
    const { app, ticketId } = await createOpenTicket();
    const response = await patchTicketStatus(app, ticketId, TicketStatuses.CANCELLED);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: TicketStatuses.CANCELLED },
    });
  });

  it('AC-5.7: In Progress -> Cancelled succeeds via PATCH', async () => {
    const { app, ticketId } = await createOpenTicket();
    await moveTicketToInProgress(app, ticketId);

    const response = await patchTicketStatus(app, ticketId, TicketStatuses.CANCELLED);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: TicketStatuses.CANCELLED },
    });
  });

  it('AC-5.8: Resolved -> Cancelled fails via PATCH', async () => {
    const { app, ticketId } = await createOpenTicket();
    await moveTicketToResolved(app, ticketId);

    const response = await patchTicketStatus(app, ticketId, TicketStatuses.CANCELLED);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.INVALID_STATUS_TRANSITION },
    });
  });

  it('AC-5.9: Resolved -> In Progress fails via PATCH', async () => {
    const { app, ticketId } = await createOpenTicket();
    await moveTicketToResolved(app, ticketId);

    const response = await patchTicketStatus(app, ticketId, TicketStatuses.IN_PROGRESS);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.INVALID_STATUS_TRANSITION },
    });
  });

  it('AC-5.10: Closed -> Cancelled fails via PATCH', async () => {
    const { app, ticketId } = await createOpenTicket();
    await moveTicketToClosed(app, ticketId);

    const response = await patchTicketStatus(app, ticketId, TicketStatuses.CANCELLED);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.INVALID_STATUS_TRANSITION },
    });
  });

  it('AC-5.12: PUT rejects invalid status transitions', async () => {
    const { app, ticketId } = await createOpenTicket();
    const response = await putTicket(app, ticketId, { status: TicketStatuses.RESOLVED });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.INVALID_STATUS_TRANSITION },
    });
  });

  it('AC-5.12: PUT allows valid status transitions', async () => {
    const { app, ticketId } = await createOpenTicket();
    const response = await putTicket(app, ticketId, { status: TicketStatuses.IN_PROGRESS });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: TicketStatuses.IN_PROGRESS },
    });
  });
});
