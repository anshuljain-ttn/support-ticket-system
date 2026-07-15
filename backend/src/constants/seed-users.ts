import type { SeedUser } from '@/types/user.types.js';

export const SEED_USERS: SeedUser[] = [
  { name: 'Alice Johnson', email: 'alice@company.com', role: 'employee' },
  { name: 'Bob Smith', email: 'bob@company.com', role: 'admin' },
  { name: 'Carol Williams', email: 'carol@company.com', role: 'admin' },
  { name: 'Dave Admin', email: 'dave@company.com', role: 'admin' },
  { name: 'Eve Employee', email: 'eve@company.com', role: 'employee' },
];

export function validateSeedUsers(users: SeedUser[]): void {
  const emails = users.map((user) => user.email.toLowerCase());
  const uniqueEmails = new Set(emails);

  if (uniqueEmails.size !== emails.length) {
    throw new Error('Seed data contains duplicate email addresses');
  }
}
