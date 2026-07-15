import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { env } from '@/config/env.js';
import { ErrorCodes } from '@/constants/error-codes.js';
import { User } from '@/models/user.model.js';
import { createTestApp, loginViaApi } from '../helpers/test-app.js';
import {
  clearTestDatabase,
  seedTestUsers,
  startTestDatabase,
  type SeededUsers,
  type TestDatabase,
} from '../helpers/test-db.js';

describe('auth REST API', () => {
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

  it('AC-19.1: POST /auth/login returns 200 and sets HTTP-only cookie on valid credentials', async () => {
    const app = createTestApp();
    const response = await request(app)
      .post('/auth/login')
      .send({ email: users.employeeEmail, password: 'Password123!' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        user: {
          email: users.employeeEmail,
          role: expect.any(String) as string,
        },
      },
    });
    expect(response.body.data.user).not.toHaveProperty('password');

    const cookieHeader = response.headers['set-cookie'];
    expect(cookieHeader).toBeDefined();
    const cookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader];
    expect(cookies.some((cookie) => cookie.startsWith(`${env.AUTH_COOKIE_NAME}=`))).toBe(true);
    expect(cookies.some((cookie) => cookie.includes('HttpOnly'))).toBe(true);
  });

  it('AC-19.2: invalid credentials return 401 INVALID_CREDENTIALS', async () => {
    const app = createTestApp();
    const response = await request(app)
      .post('/auth/login')
      .send({ email: users.employeeEmail, password: 'WrongPassword!' });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.INVALID_CREDENTIALS },
    });
  });

  it('AC-19.3: GET /auth/me returns authenticated user without password', async () => {
    const app = createTestApp();
    const agent = await loginViaApi(app, users.employeeEmail);

    const response = await agent.get('/auth/me');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        _id: users.employeeId,
        email: users.employeeEmail,
      },
    });
    expect(response.body.data).not.toHaveProperty('password');
  });

  it('AC-19.4: POST /auth/logout clears cookie', async () => {
    const app = createTestApp();
    const agent = await loginViaApi(app, users.employeeEmail);

    const meBeforeLogout = await agent.get('/auth/me');
    expect(meBeforeLogout.status).toBe(200);

    const logoutResponse = await agent.post('/auth/logout');
    expect(logoutResponse.status).toBe(200);

    const meAfterLogout = await agent.get('/auth/me');
    expect(meAfterLogout.status).toBe(401);
    expect(meAfterLogout.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.UNAUTHORIZED },
    });
  });

  it('AC-19.5: protected routes return 401 without auth', async () => {
    const app = createTestApp();
    const response = await request(app).get('/tickets');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.UNAUTHORIZED },
    });
  });

  it('AC-19.6: inactive user login returns 403 USER_INACTIVE', async () => {
    const app = createTestApp();
    await User.updateOne({ email: users.employeeEmail }, { isActive: false });

    const response = await request(app)
      .post('/auth/login')
      .send({ email: users.employeeEmail, password: 'Password123!' });

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: ErrorCodes.USER_INACTIVE },
    });
  });
});
