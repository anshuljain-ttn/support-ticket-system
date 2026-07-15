import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '@/app.js';
import { ErrorCodes } from '@/constants/error-codes.js';
import { userRepository } from '@/repositories/user.repository.js';
import { userService } from '@/services/user.service.js';

let mongoServer: MongoMemoryServer;

describe('users integration', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    await userRepository.deleteAll();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('seeds five users and lists them via GET /users', async () => {
    const seededUsers = await userService.seedUsers();
    expect(seededUsers).toHaveLength(5);

    const app = createApp();
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
