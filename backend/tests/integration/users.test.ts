import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ErrorCodes } from '@/constants/error-codes.js';
import { userService } from '@/services/user.service.js';
import { createTestApp } from '../helpers/test-app.js';
import { clearTestDatabase, startTestDatabase, type TestDatabase } from '../helpers/test-db.js';

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

  it('seeds five users and lists them via GET /users', async () => {
    const seededUsers = await userService.seedUsers();
    expect(seededUsers).toHaveLength(5);

    const app = createTestApp();
    const response = await request(app).get('/users');

    expect(response.status).toBe(200);
    expect((response.body as { data: unknown[] }).data).toHaveLength(5);
  });

  it('fails when seeding duplicate users in the database', async () => {
    await userService.seedUsers();

    await expect(userService.seedUsers()).rejects.toMatchObject({
      code: ErrorCodes.VALIDATION_ERROR,
    });
  });
});
