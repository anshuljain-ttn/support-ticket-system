import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { Roles } from '@/constants/roles.js';
import { ErrorCodes } from '@/constants/error-codes.js';
import type { TicketDocument } from '@/models/ticket.model.js';
import { permissionService } from '@/services/permission.service.js';
import { TicketStatuses } from '@/types/ticket.types.js';
import type { UserRecord } from '@/types/user.types.js';

function createUser(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    _id: new Types.ObjectId().toString(),
    name: 'Test User',
    email: 'test@company.com',
    role: Roles.EMPLOYEE,
    avatar: 'https://example.com/avatar.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function createTicket(
  overrides: Partial<{ createdBy: string; assignedTo?: string; status: typeof TicketStatuses.OPEN }> = {},
): TicketDocument {
  const createdBy = overrides.createdBy ?? new Types.ObjectId().toString();

  return {
    createdBy: new Types.ObjectId(createdBy),
    assignedTo: overrides.assignedTo ? new Types.ObjectId(overrides.assignedTo) : undefined,
    status: overrides.status ?? TicketStatuses.OPEN,
  } as TicketDocument;
}

describe('permissionService', () => {
  const employee = createUser({ role: Roles.EMPLOYEE, email: 'employee@company.com' });
  const otherEmployee = createUser({ role: Roles.EMPLOYEE, email: 'other@company.com' });
  const admin = createUser({ role: Roles.ADMIN, email: 'admin@company.com' });
  const superAdmin = createUser({ role: Roles.SUPER_ADMIN, email: 'superadmin@company.com' });

  describe('canViewTicket', () => {
    it('allows super admin to view any ticket', () => {
      const ticket = createTicket({ createdBy: employee._id });
      expect(permissionService.canViewTicket(superAdmin, ticket)).toBe(true);
    });

    it('allows employee to view own ticket', () => {
      const ticket = createTicket({ createdBy: employee._id });
      expect(permissionService.canViewTicket(employee, ticket)).toBe(true);
    });

    it('denies employee viewing another employee ticket', () => {
      const ticket = createTicket({ createdBy: otherEmployee._id });
      expect(permissionService.canViewTicket(employee, ticket)).toBe(false);
    });

    it('allows admin to view employee ticket', () => {
      const ticket = createTicket({ createdBy: employee._id });
      expect(permissionService.canViewTicket(admin, ticket)).toBe(true);
    });

    it('allows admin to view own ticket via ownership rule', () => {
      const ticket = createTicket({ createdBy: admin._id });
      expect(permissionService.canViewTicket(admin, ticket)).toBe(true);
    });

    it('allows admin viewing own ticket when assigned to self', () => {
      const ticket = createTicket({ createdBy: admin._id, assignedTo: admin._id });
      expect(permissionService.canViewTicket(admin, ticket)).toBe(true);
    });

    it('allows admin viewing ticket assigned to them regardless of creator', () => {
      const ticket = createTicket({ createdBy: employee._id, assignedTo: admin._id });
      expect(permissionService.canViewTicket(admin, ticket)).toBe(true);
    });
  });

  describe('getTicketListFilter', () => {
    it('returns empty filter for super admin (all tickets)', () => {
      expect(permissionService.getTicketListFilter(superAdmin)).toEqual({});
    });

    it('scopes employee list to own created tickets', () => {
      const filter = permissionService.getTicketListFilter(employee);
      expect(filter).toEqual({ createdBy: new Types.ObjectId(employee._id) });
    });

    it('scopes admin list to own, assigned, and active non-own tickets', () => {
      const filter = permissionService.getTicketListFilter(admin);

      expect(filter).toHaveProperty('$or');
      expect(filter.$or).toHaveLength(3);
      expect(filter.$or?.[0]).toEqual({ createdBy: new Types.ObjectId(admin._id) });
      expect(filter.$or?.[1]).toEqual({ assignedTo: new Types.ObjectId(admin._id) });
      expect(filter.$or?.[2]).toEqual({
        createdBy: { $ne: new Types.ObjectId(admin._id) },
        status: {
          $in: [TicketStatuses.OPEN, TicketStatuses.IN_PROGRESS, TicketStatuses.RESOLVED],
        },
      });
    });
  });

  describe('canCommentOnTicket', () => {
    it('mirrors canViewTicket for employee owner', () => {
      const ticket = createTicket({ createdBy: employee._id });
      expect(permissionService.canCommentOnTicket(employee, ticket)).toBe(true);
    });

    it('denies employee commenting on another employee ticket', () => {
      const ticket = createTicket({ createdBy: otherEmployee._id });
      expect(permissionService.canCommentOnTicket(employee, ticket)).toBe(false);
    });
  });

  describe('canCreateTicket', () => {
    it('allows active users to create tickets', () => {
      expect(permissionService.canCreateTicket(employee)).toBe(true);
    });

    it('denies inactive users from creating tickets', () => {
      expect(permissionService.canCreateTicket({ ...employee, isActive: false })).toBe(false);
    });
  });

  describe('canUpdateTicket', () => {
    it('allows employee to update own open ticket', () => {
      const ticket = createTicket({ createdBy: employee._id, status: TicketStatuses.OPEN });
      expect(permissionService.canUpdateTicket(employee, ticket)).toBe(true);
    });

    it('denies employee updating own ticket after Open', () => {
      const ticket = createTicket({ createdBy: employee._id, status: TicketStatuses.IN_PROGRESS });
      expect(permissionService.canUpdateTicket(employee, ticket)).toBe(false);
    });

    it('allows admin to update employee ticket', () => {
      const ticket = createTicket({ createdBy: employee._id });
      expect(permissionService.canUpdateTicket(admin, ticket)).toBe(true);
    });

    it('allows admin to update own open ticket', () => {
      const ticket = createTicket({ createdBy: admin._id, status: TicketStatuses.OPEN });
      expect(permissionService.canUpdateTicket(admin, ticket)).toBe(true);
    });

    it('denies admin updating own ticket after Open', () => {
      const ticket = createTicket({ createdBy: admin._id, status: TicketStatuses.IN_PROGRESS });
      expect(permissionService.canUpdateTicket(admin, ticket)).toBe(false);
    });

    it('allows super admin to update any ticket', () => {
      const ticket = createTicket({ createdBy: employee._id, status: TicketStatuses.CLOSED });
      expect(permissionService.canUpdateTicket(superAdmin, ticket)).toBe(true);
    });
  });

  describe('canAssignTicket', () => {
    it('allows admin to assign employee ticket', () => {
      const ticket = createTicket({ createdBy: employee._id });
      expect(permissionService.canAssignTicket(admin, ticket)).toBe(true);
    });

    it('denies employee from assigning tickets', () => {
      const ticket = createTicket({ createdBy: employee._id });
      expect(permissionService.canAssignTicket(employee, ticket)).toBe(false);
    });

    it('denies admin from assigning own ticket', () => {
      const ticket = createTicket({ createdBy: admin._id });
      expect(permissionService.canAssignTicket(admin, ticket)).toBe(false);
    });
  });

  describe('canChangeStatus', () => {
    it('allows employee to cancel own open ticket', () => {
      const ticket = createTicket({ createdBy: employee._id, status: TicketStatuses.OPEN });
      expect(
        permissionService.canChangeStatus(employee, ticket, TicketStatuses.CANCELLED),
      ).toBe(true);
    });

    it('denies employee from resolving own ticket', () => {
      const ticket = createTicket({ createdBy: employee._id, status: TicketStatuses.OPEN });
      expect(
        permissionService.canChangeStatus(employee, ticket, TicketStatuses.RESOLVED),
      ).toBe(false);
    });

    it('denies admin from transitioning own ticket', () => {
      const ticket = createTicket({ createdBy: admin._id, status: TicketStatuses.OPEN });
      expect(
        permissionService.canChangeStatus(admin, ticket, TicketStatuses.IN_PROGRESS),
      ).toBe(false);
    });

    it('allows admin to transition employee ticket', () => {
      const ticket = createTicket({ createdBy: employee._id, status: TicketStatuses.OPEN });
      expect(
        permissionService.canChangeStatus(admin, ticket, TicketStatuses.IN_PROGRESS),
      ).toBe(true);
    });

    it('allows super admin to transition any ticket', () => {
      const ticket = createTicket({ createdBy: admin._id, status: TicketStatuses.OPEN });
      expect(
        permissionService.canChangeStatus(superAdmin, ticket, TicketStatuses.IN_PROGRESS),
      ).toBe(true);
    });
  });

  describe('getAllowedTransitionsForUser', () => {
    it('returns only Cancelled for employee owner on open ticket', () => {
      const ticket = createTicket({ createdBy: employee._id, status: TicketStatuses.OPEN });
      expect(permissionService.getAllowedTransitionsForUser(employee, ticket)).toEqual([
        TicketStatuses.CANCELLED,
      ]);
    });

    it('returns workflow transitions for admin on employee ticket', () => {
      const ticket = createTicket({ createdBy: employee._id, status: TicketStatuses.OPEN });
      expect(permissionService.getAllowedTransitionsForUser(admin, ticket)).toEqual([
        TicketStatuses.IN_PROGRESS,
        TicketStatuses.CANCELLED,
      ]);
    });

    it('returns workflow transitions for super admin', () => {
      const ticket = createTicket({ createdBy: employee._id, status: TicketStatuses.OPEN });
      expect(permissionService.getAllowedTransitionsForUser(superAdmin, ticket)).toEqual([
        TicketStatuses.IN_PROGRESS,
        TicketStatuses.CANCELLED,
      ]);
    });

    it('returns empty array for employee owner after Open status', () => {
      const ticket = createTicket({
        createdBy: employee._id,
        status: TicketStatuses.IN_PROGRESS,
      });
      expect(permissionService.getAllowedTransitionsForUser(employee, ticket)).toEqual([]);
    });

    it('returns only Cancelled for admin owner on open ticket', () => {
      const ticket = createTicket({ createdBy: admin._id, status: TicketStatuses.OPEN });
      expect(permissionService.getAllowedTransitionsForUser(admin, ticket)).toEqual([
        TicketStatuses.CANCELLED,
      ]);
    });

    it('returns empty array for admin owner after Open status', () => {
      const ticket = createTicket({ createdBy: admin._id, status: TicketStatuses.IN_PROGRESS });
      expect(permissionService.getAllowedTransitionsForUser(admin, ticket)).toEqual([]);
    });

    it('returns workflow transitions for admin on In Progress employee ticket', () => {
      const ticket = createTicket({
        createdBy: employee._id,
        status: TicketStatuses.IN_PROGRESS,
      });
      expect(permissionService.getAllowedTransitionsForUser(admin, ticket)).toEqual([
        TicketStatuses.RESOLVED,
        TicketStatuses.CANCELLED,
      ]);
    });
  });

  describe('assert methods', () => {
    it('throws FORBIDDEN when employee views another ticket', () => {
      const ticket = createTicket({ createdBy: otherEmployee._id });

      expect(() => permissionService.assertCanViewTicket(employee, ticket)).toThrow(
        expect.objectContaining({ code: ErrorCodes.FORBIDDEN }),
      );
    });

    it('throws FORBIDDEN when inactive user creates ticket', () => {
      const inactive = { ...employee, isActive: false };

      expect(() => permissionService.assertCanCreateTicket(inactive)).toThrow(
        expect.objectContaining({ code: ErrorCodes.FORBIDDEN }),
      );
    });

    it('throws FORBIDDEN when employee updates own ticket after Open', () => {
      const ticket = createTicket({ createdBy: employee._id, status: TicketStatuses.IN_PROGRESS });

      expect(() => permissionService.assertCanUpdateTicket(employee, ticket)).toThrow(
        expect.objectContaining({ code: ErrorCodes.FORBIDDEN }),
      );
    });

    it('throws FORBIDDEN when employee assigns ticket', () => {
      const ticket = createTicket({ createdBy: employee._id });

      expect(() => permissionService.assertCanAssignTicket(employee, ticket)).toThrow(
        expect.objectContaining({ code: ErrorCodes.FORBIDDEN }),
      );
    });

    it('throws FORBIDDEN when admin transitions own ticket', () => {
      const ticket = createTicket({ createdBy: admin._id, status: TicketStatuses.OPEN });

      expect(() =>
        permissionService.assertCanChangeStatus(admin, ticket, TicketStatuses.IN_PROGRESS),
      ).toThrow(expect.objectContaining({ code: ErrorCodes.FORBIDDEN }));
    });

    it('throws FORBIDDEN when employee comments on another ticket', () => {
      const ticket = createTicket({ createdBy: otherEmployee._id });

      expect(() => permissionService.assertCanCommentOnTicket(employee, ticket)).toThrow(
        expect.objectContaining({ code: ErrorCodes.FORBIDDEN }),
      );
    });
  });
});
