import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ErrorCodes } from '@/constants/error-codes.js';
import { HistoryActions } from '@/constants/permissions.js';
import { userService } from '@/services/user.service.js';
import {
  createTestApp,
  createTicketViaApi,
  loginViaApi,
  patchTicketStatus,
} from '../helpers/test-app.js';
import {
  clearTestDatabase,
  seedTestUsers,
  startTestDatabase,
  type SeededUsers,
  type TestDatabase,
} from '../helpers/test-db.js';
import { TicketStatuses } from '@/types/ticket.types.js';

describe('failure modes and edge cases', () => {
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

  describe('list/search scope isolation', () => {
    it('employee B cannot see employee A tickets in GET /tickets', async () => {
      const app = createTestApp();
      const ownerAgent = await loginViaApi(app, users.employeeEmail);
      const otherEmployee = await userService.getUserByEmail('dave@company.com');
      expect(otherEmployee).not.toBeNull();

      const ticketId = await createTicketViaApi(ownerAgent, {
        title: 'Scope isolation ticket',
        description: 'Only the creator should see this in list results.',
      });

      const otherAgent = await loginViaApi(app, otherEmployee!.email);
      const response = await otherAgent.get('/tickets');

      expect(response.status).toBe(200);
      const items = (response.body as { data: { items: { _id: string }[] } }).data.items;
      expect(items.some((ticket) => ticket._id === ticketId)).toBe(false);
    });

    it('employee B cannot find employee A tickets via GET /tickets/search', async () => {
      const app = createTestApp();
      const ownerAgent = await loginViaApi(app, users.employeeEmail);
      const otherEmployee = await userService.getUserByEmail('dave@company.com');
      expect(otherEmployee).not.toBeNull();

      await createTicketViaApi(ownerAgent, {
        title: 'Unique scope search keyword',
        description: 'Scoped search should not leak across employees.',
      });

      const otherAgent = await loginViaApi(app, otherEmployee!.email);
      const response = await otherAgent.get('/tickets/search').query({
        q: 'unique scope search keyword',
        page: 1,
        limit: 10,
      });

      expect(response.status).toBe(200);
      const items = (response.body as { data: { items: { _id: string }[] } }).data.items;
      expect(items).toHaveLength(0);
    });
  });

  describe('admin ownership edge cases', () => {
    it('admin can view own ticket but with restricted workflow permissions', async () => {
      const app = createTestApp();
      const adminAgent = await loginViaApi(app, users.adminEmail);
      const ticketId = await createTicketViaApi(adminAgent, {
        title: 'Admin own ticket',
        description: 'Admin can view own ticket but cannot advance workflow.',
      });

      const response = await adminAgent.get(`/tickets/${ticketId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.permissions).toEqual({
        canEdit: true,
        canAssign: false,
        canChangeStatus: true,
        canComment: true,
      });
      expect(response.body.data.allowedTransitions).toEqual([TicketStatuses.CANCELLED]);
    });

    it('employee cannot assign tickets', async () => {
      const app = createTestApp();
      const employeeAgent = await loginViaApi(app, users.employeeEmail);
      const ticketId = await createTicketViaApi(employeeAgent);

      const response = await employeeAgent
        .patch(`/tickets/${ticketId}/assign`)
        .send({ assignedTo: users.adminId });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        success: false,
        error: { code: ErrorCodes.FORBIDDEN },
      });
    });

    it('admin cannot assign own ticket', async () => {
      const app = createTestApp();
      const adminAgent = await loginViaApi(app, users.adminEmail);
      const ticketId = await createTicketViaApi(adminAgent);

      const response = await adminAgent
        .patch(`/tickets/${ticketId}/assign`)
        .send({ assignedTo: users.employeeId });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        success: false,
        error: { code: ErrorCodes.FORBIDDEN },
      });
    });
  });

  describe('permission vs state machine ordering', () => {
    it('employee Open -> Resolved returns 403 (permission) not 400 (state machine)', async () => {
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

    it('employee Open -> In Progress returns 403 before state machine validation', async () => {
      const app = createTestApp();
      const employeeAgent = await loginViaApi(app, users.employeeEmail);
      const ticketId = await createTicketViaApi(employeeAgent);

      const response = await patchTicketStatus(employeeAgent, ticketId, TicketStatuses.IN_PROGRESS);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe(ErrorCodes.FORBIDDEN);
    });
  });

  describe('state machine edge cases', () => {
    it('idempotent PATCH with same status returns 200', async () => {
      const app = createTestApp();
      const employeeAgent = await loginViaApi(app, users.employeeEmail);
      const adminAgent = await loginViaApi(app, users.adminEmail);
      const ticketId = await createTicketViaApi(employeeAgent);

      await patchTicketStatus(adminAgent, ticketId, TicketStatuses.IN_PROGRESS);

      const response = await patchTicketStatus(adminAgent, ticketId, TicketStatuses.IN_PROGRESS);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: { status: TicketStatuses.IN_PROGRESS },
      });
    });

    it('admin invalid transition on employee ticket returns 400', async () => {
      const app = createTestApp();
      const employeeAgent = await loginViaApi(app, users.employeeEmail);
      const adminAgent = await loginViaApi(app, users.adminEmail);
      const ticketId = await createTicketViaApi(employeeAgent);

      await patchTicketStatus(adminAgent, ticketId, TicketStatuses.IN_PROGRESS);
      await patchTicketStatus(adminAgent, ticketId, TicketStatuses.RESOLVED);

      const response = await patchTicketStatus(adminAgent, ticketId, TicketStatuses.CANCELLED);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        error: { code: ErrorCodes.INVALID_STATUS_TRANSITION },
      });
    });
  });

  describe('comment permission failures', () => {
    it('employee cannot comment on another employee ticket', async () => {
      const app = createTestApp();
      const ownerAgent = await loginViaApi(app, users.employeeEmail);
      const otherEmployee = await userService.getUserByEmail('dave@company.com');
      expect(otherEmployee).not.toBeNull();

      const ticketId = await createTicketViaApi(ownerAgent);
      const otherAgent = await loginViaApi(app, otherEmployee!.email);

      const response = await otherAgent.post(`/tickets/${ticketId}/comments`).send({
        message: 'Unauthorized comment attempt.',
      });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        success: false,
        error: { code: ErrorCodes.FORBIDDEN },
      });
    });
  });

  describe('ticket detail permissions flags', () => {
    it('returns correct permissions for employee owner on open ticket', async () => {
      const app = createTestApp();
      const employeeAgent = await loginViaApi(app, users.employeeEmail);
      const ticketId = await createTicketViaApi(employeeAgent);

      const response = await employeeAgent.get(`/tickets/${ticketId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.permissions).toEqual({
        canEdit: true,
        canAssign: false,
        canChangeStatus: true,
        canComment: true,
      });
    });

    it('returns restricted permissions for employee owner after Open', async () => {
      const app = createTestApp();
      const employeeAgent = await loginViaApi(app, users.employeeEmail);
      const adminAgent = await loginViaApi(app, users.adminEmail);
      const ticketId = await createTicketViaApi(employeeAgent);

      await patchTicketStatus(adminAgent, ticketId, TicketStatuses.IN_PROGRESS);

      const response = await employeeAgent.get(`/tickets/${ticketId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.permissions).toEqual({
        canEdit: false,
        canAssign: false,
        canChangeStatus: false,
        canComment: true,
      });
    });
  });

  describe('audit history on mutations', () => {
    it('status change appends STATUS_CHANGED history entry', async () => {
      const app = createTestApp();
      const employeeAgent = await loginViaApi(app, users.employeeEmail);
      const adminAgent = await loginViaApi(app, users.adminEmail);
      const ticketId = await createTicketViaApi(employeeAgent);

      await patchTicketStatus(adminAgent, ticketId, TicketStatuses.IN_PROGRESS);

      const response = await adminAgent.get(`/tickets/${ticketId}`);

      expect(response.status).toBe(200);
      const history = response.body.data.history as {
        action: string;
        previousValue: string | null;
        newValue: string | null;
      }[];

      expect(history.some((entry) => entry.action === HistoryActions.CREATED)).toBe(true);
      expect(
        history.some(
          (entry) =>
            entry.action === HistoryActions.STATUS_CHANGED &&
            entry.previousValue === TicketStatuses.OPEN &&
            entry.newValue === TicketStatuses.IN_PROGRESS,
        ),
      ).toBe(true);
    });

    it('assign appends ASSIGNED history entry', async () => {
      const app = createTestApp();
      const employeeAgent = await loginViaApi(app, users.employeeEmail);
      const adminAgent = await loginViaApi(app, users.adminEmail);
      const ticketId = await createTicketViaApi(employeeAgent);

      const assignResponse = await adminAgent
        .patch(`/tickets/${ticketId}/assign`)
        .send({ assignedTo: users.adminId });
      expect(assignResponse.status).toBe(200);

      const response = await adminAgent.get(`/tickets/${ticketId}`);

      expect(response.status).toBe(200);
      const history = response.body.data.history as { action: string }[];
      expect(history.some((entry) => entry.action === HistoryActions.ASSIGNED)).toBe(true);
    });
  });
});
