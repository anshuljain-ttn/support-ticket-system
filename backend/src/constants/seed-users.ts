import { Roles } from '@/constants/roles.js';
import type { SeedUser } from '@/types/user.types.js';

export const SEED_USERS: SeedUser[] = [
  {
    name: 'Sophia Chen',
    email: 'superadmin@company.com',
    role: Roles.SUPER_ADMIN,
  },
  {
    name: 'Bob Smith',
    email: 'bob@company.com',
    role: Roles.ADMIN,
  },
  {
    name: 'Carol Williams',
    email: 'carol@company.com',
    role: Roles.ADMIN,
  },
  {
    name: 'Alice Johnson',
    email: 'alice@company.com',
    role: Roles.EMPLOYEE,
  },
  {
    name: 'Dave Miller',
    email: 'dave@company.com',
    role: Roles.EMPLOYEE,
  },
  {
    name: 'Eve Parker',
    email: 'eve@company.com',
    role: Roles.EMPLOYEE,
  },
];

export function validateSeedUsers(users: SeedUser[]): void {
  const emails = users.map((user) => user.email.toLowerCase());
  const uniqueEmails = new Set(emails);

  if (uniqueEmails.size !== emails.length) {
    throw new Error('Seed data contains duplicate email addresses');
  }

  const roleCounts = users.reduce<Record<string, number>>((acc, user) => {
    acc[user.role] = (acc[user.role] ?? 0) + 1;
    return acc;
  }, {});

  if (roleCounts[Roles.SUPER_ADMIN] !== 1) {
    throw new Error('Seed data must include exactly one SUPER_ADMIN user');
  }

  if (roleCounts[Roles.ADMIN] !== 2) {
    throw new Error('Seed data must include exactly two ADMIN users');
  }

  if (roleCounts[Roles.EMPLOYEE] !== 3) {
    throw new Error('Seed data must include exactly three EMPLOYEE users');
  }
}
