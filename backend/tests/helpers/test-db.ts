import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { Comment } from '@/models/comment.model.js';
import { Ticket } from '@/models/ticket.model.js';
import { commentRepository } from '@/repositories/comment.repository.js';
import { ticketRepository } from '@/repositories/ticket.repository.js';
import { userRepository } from '@/repositories/user.repository.js';
import { userService } from '@/services/user.service.js';

export type TestDatabase = {
  stop: () => Promise<void>;
};

export type SeededUsers = {
  employeeId: string;
  adminId: string;
};

export async function startTestDatabase(): Promise<TestDatabase> {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Promise.all([Ticket.syncIndexes(), Comment.syncIndexes()]);

  return {
    async stop() {
      await mongoose.disconnect();
      await mongoServer.stop();
    },
  };
}

export async function clearTestDatabase(): Promise<void> {
  await commentRepository.deleteAll();
  await ticketRepository.deleteAll();
  await userRepository.deleteAll();
}

export async function seedTestUsers(): Promise<SeededUsers> {
  await userService.seedUsers();
  const users = await userRepository.findAll();
  const employee = users.find((user) => user.role === 'employee');
  const admin = users.find((user) => user.role === 'admin');

  if (!employee || !admin) {
    throw new Error('Expected seeded employee and admin users');
  }

  return {
    employeeId: employee._id.toString(),
    adminId: admin._id.toString(),
  };
}
