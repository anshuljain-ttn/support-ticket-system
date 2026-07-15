import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ErrorCodes } from '@/constants/error-codes.js';
import { userService } from '@/services/user.service.js';
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

describe('RBAC permissions integration', () => {
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

  it('AC-20.2: employee cannot resolve ticket', async () => {
    const app = createTestApp();
    const employeeAgent = await loginViaApi(app, users.employeeEmail);
    const ticketId = await createTicketViaApi(employeeAgent);

    const response = await patchTicketStatus(employeeAgent, ticketId, TicketStatuses.RESOLVED);

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.FORBIDDEN },
    });
  });

  it('AC-20.3: employee cannot edit ticket after Open', async () => {
    const app = createTestApp();
    const employeeAgent = await loginViaApi(app, users.employeeEmail);
    const adminAgent = await loginViaApi(app, users.adminEmail);
    const ticketId = await createTicketViaApi(employeeAgent);

    await patchTicketStatus(adminAgent, ticketId, TicketStatuses.IN_PROGRESS);

    const response = await putTicket(employeeAgent, ticketId, { title: 'Updated title attempt' });

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.FORBIDDEN },
    });
  });

  it('AC-20.4: employee cannot access another employee ticket', async () => {
    const app = createTestApp();
    const ownerAgent = await loginViaApi(app, users.employeeEmail);
    const otherEmployee = await userService.getUserByEmail('dave@company.com');
    expect(otherEmployee).not.toBeNull();

    const ticketId = await createTicketViaApi(ownerAgent);
    const otherAgent = await loginViaApi(app, otherEmployee!.email);

    const response = await otherAgent.get(`/tickets/${ticketId}`);

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.FORBIDDEN },
    });
  });

  it('AC-20.5: admin cannot transition own ticket', async () => {
    const app = createTestApp();
    const adminAgent = await loginViaApi(app, users.adminEmail);
    const ticketId = await createTicketViaApi(adminAgent);

    const response = await patchTicketStatus(adminAgent, ticketId, TicketStatuses.IN_PROGRESS);

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.FORBIDDEN },
    });
  });

  it('AC-20.6: admin can transition employee ticket', async () => {
    const app = createTestApp();
    const employeeAgent = await loginViaApi(app, users.employeeEmail);
    const adminAgent = await loginViaApi(app, users.adminEmail);
    const ticketId = await createTicketViaApi(employeeAgent);

    const response = await patchTicketStatus(adminAgent, ticketId, TicketStatuses.IN_PROGRESS);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: TicketStatuses.IN_PROGRESS },
    });
  });

  it('AC-20.7: super admin can perform every action', async () => {
    const app = createTestApp();
    const employeeAgent = await loginViaApi(app, users.employeeEmail);
    const superAdminAgent = await loginViaApi(app, users.superAdminEmail);
    const ticketId = await createTicketViaApi(employeeAgent);

    const inProgress = await patchTicketStatus(
      superAdminAgent,
      ticketId,
      TicketStatuses.IN_PROGRESS,
    );
    expect(inProgress.status).toBe(200);

    const resolved = await patchTicketStatus(superAdminAgent, ticketId, TicketStatuses.RESOLVED);
    expect(resolved.status).toBe(200);

    const updated = await putTicket(superAdminAgent, ticketId, { title: 'Super admin updated title' });
    expect(updated.status).toBe(200);

    const comment = await superAdminAgent.post(`/tickets/${ticketId}/comments`).send({
      message: 'Super admin comment',
    });
    expect(comment.status).toBe(201);
  });
});
