import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { Roles } from '@/constants/roles.js';
import { SEED_USERS } from '@/constants/seed-users.js';
import { ErrorCodes } from '@/constants/error-codes.js';
import { userRepository } from '@/repositories/user.repository.js';
import { userService } from '@/services/user.service.js';
import { comparePassword } from '@/utils/password.js';
import { createTestApp, loginViaApi } from '../helpers/test-app.js';
import { clearTestDatabase, seedTestUsers, startTestDatabase, type TestDatabase } from '../helpers/test-db.js';

describe('users integration', () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await startTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await testDb.stop();
  });

  it('AC-22.1: seeds six users with required roles', async () => {
    const seededUsers = await userService.seedUsers();
    expect(seededUsers).toHaveLength(6);

    const roleCounts = seededUsers.reduce<Record<string, number>>((acc, user) => {
      acc[user.role] = (acc[user.role] ?? 0) + 1;
      return acc;
    }, {});

    expect(roleCounts[Roles.SUPER_ADMIN]).toBe(1);
    expect(roleCounts[Roles.ADMIN]).toBe(2);
    expect(roleCounts[Roles.EMPLOYEE]).toBe(3);
  });

  it('AC-22.2: seeded users expose public profile fields', async () => {
    const seededUsers = await userService.seedUsers();
    const alice = seededUsers.find((user) => user.email === 'alice@company.com');

    expect(alice).toMatchObject({
      name: 'Alice Johnson',
      role: Roles.EMPLOYEE,
      isActive: true,
    });
    expect(alice?.avatar).toContain('dicebear.com');
    expect(alice?.createdAt).toBeTruthy();
    expect(alice).not.toHaveProperty('password');
  });

  it('AC-22.3: passwords are stored hashed in the database', async () => {
    await userService.seedUsers();
    const storedUser = await userRepository.findByEmailWithPassword('alice@company.com');

    expect(storedUser?.password).toBeTruthy();
    expect(storedUser?.password).not.toBe('Password123!');
    await expect(comparePassword('Password123!', storedUser?.password ?? '')).resolves.toBe(true);
  });

  it('lists seeded users via GET /users', async () => {
    const app = createTestApp();
    const users = await seedTestUsers();
    const agent = await loginViaApi(app, users.employeeEmail);
    const response = await agent.get('/users');

    expect(response.status).toBe(200);
    expect((response.body as { data: unknown[] }).data).toHaveLength(6);
  });

  it('fails when seeding duplicate users in the database', async () => {
    await userService.seedUsers();

    await expect(userService.seedUsers()).rejects.toMatchObject({
      code: ErrorCodes.VALIDATION_ERROR,
    });
  });

  it('rejects invalid seed role distribution', async () => {
    await expect(
      userService.seedUsers([
        ...SEED_USERS,
        { name: 'Extra', email: 'extra@company.com', role: Roles.EMPLOYEE },
      ]),
    ).rejects.toThrow('Seed data must include exactly three EMPLOYEE users');
  });
});
