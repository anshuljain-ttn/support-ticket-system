import { SEED_USERS, validateSeedUsers } from '@/constants/seed-users.js';
import { ErrorCodes } from '@/constants/error-codes.js';
import { toUserDto, toUserDtoList } from '@/dto/user.dto.js';
import { userRepository } from '@/repositories/user.repository.js';
import type { UserRecord } from '@/types/user.types.js';
import { AppError } from '@/utils/app-error.js';

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

    const createdUsers = await userRepository.createMany(users);
    return toUserDtoList(createdUsers);
  },
};
