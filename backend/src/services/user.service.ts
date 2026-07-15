import { SEED_USERS, validateSeedUsers } from '@/constants/seed-users.js';
import { Roles } from '@/constants/roles.js';
import { ErrorCodes } from '@/constants/error-codes.js';
import { env } from '@/config/env.js';
import { toUserDto, toUserDtoList } from '@/dto/user.dto.js';
import { userRepository } from '@/repositories/user.repository.js';
import type { UserRecord } from '@/types/user.types.js';
import { AppError } from '@/utils/app-error.js';
import { buildAvatarUrl } from '@/utils/avatar.js';
import { hashPassword } from '@/utils/password.js';

export const userService = {
  async getAllUsers(): Promise<UserRecord[]> {
    const users = await userRepository.findAll();
    return toUserDtoList(users);
  },

  async getUserById(id: string): Promise<UserRecord | null> {
    const user = await userRepository.findById(id);
    return user ? toUserDto(user) : null;
  },

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    const user = await userRepository.findByEmail(email);
    return user ? toUserDto(user) : null;
  },

  async ensureUserExists(id: string, field = 'user'): Promise<UserRecord> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError(ErrorCodes.USER_NOT_FOUND, `User not found for ${field}`, 400, [
        { field, message: 'Referenced user does not exist' },
      ]);
    }

    return toUserDto(user);
  },

  async ensureAssignableUser(id: string, field = 'assignedTo'): Promise<UserRecord> {
    const user = await this.ensureUserExists(id, field);

    if (user.role !== Roles.ADMIN && user.role !== Roles.SUPER_ADMIN) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'Only admins can be assigned to tickets',
        400,
        [{ field, message: 'Assignee must be an admin or super admin' }],
      );
    }

    return user;
  },

  async seedUsers(users = SEED_USERS): Promise<UserRecord[]> {
    validateSeedUsers(users);

    for (const user of users) {
      const existingUser = await userRepository.findByEmail(user.email);

      if (existingUser) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          `User with email ${user.email} already exists`,
          400,
          [{ field: 'email', message: `Duplicate email: ${user.email}` }],
        );
      }
    }

    const hashedPassword = await hashPassword(env.SEED_DEFAULT_PASSWORD);

    const createdUsers = await userRepository.createMany(
      users.map((user) => ({
        name: user.name,
        email: user.email,
        role: user.role,
        password: hashedPassword,
        avatar: buildAvatarUrl(user.name),
        isActive: true,
      })),
    );

    return toUserDtoList(createdUsers);
  },
};
