import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { Roles } from '@/constants/roles.js';
import { Comment } from '@/models/comment.model.js';
import { Ticket } from '@/models/ticket.model.js';
import { User } from '@/models/user.model.js';
import { commentRepository } from '@/repositories/comment.repository.js';
import { ticketRepository } from '@/repositories/ticket.repository.js';
import { userRepository } from '@/repositories/user.repository.js';
import { userService } from '@/services/user.service.js';

export type TestDatabase = {
  stop: () => Promise<void>;
};

export type SeededUsers = {
  employeeId: string;
  employeeEmail: string;
  adminId: string;
  adminEmail: string;
  superAdminId: string;
  superAdminEmail: string;
};

export async function startTestDatabase(): Promise<TestDatabase> {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Promise.all([User.syncIndexes(), Ticket.syncIndexes(), Comment.syncIndexes()]);

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
  const employee = users.find((user) => user.role === Roles.EMPLOYEE);
  const admin = users.find((user) => user.role === Roles.ADMIN);
  const superAdmin = users.find((user) => user.role === Roles.SUPER_ADMIN);

  if (!employee || !admin || !superAdmin) {
    throw new Error('Expected seeded employee, admin, and super admin users');
  }

  return {
    employeeId: employee._id.toString(),
    employeeEmail: employee.email,
    adminId: admin._id.toString(),
    adminEmail: admin.email,
    superAdminId: superAdmin._id.toString(),
    superAdminEmail: superAdmin.email,
  };
}
