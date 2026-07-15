import { env } from '@/config/env.js';
import { ErrorCodes } from '@/constants/error-codes.js';
import { toUserDto } from '@/dto/user.dto.js';
import { userRepository } from '@/repositories/user.repository.js';
import type { UserRecord } from '@/types/user.types.js';
import { AppError } from '@/utils/app-error.js';
import { getAuthCookieOptions, getClearAuthCookieOptions } from '@/utils/auth-cookie.js';
import { signAccessToken } from '@/utils/jwt.js';
import { comparePassword } from '@/utils/password.js';
import type { LoginBody } from '@/validators/auth.validator.js';

export const authService = {
  async login(input: LoginBody): Promise<{ user: UserRecord; token: string }> {
    const user = await userRepository.findByEmailWithPassword(input.email);

    if (!user) {
      throw new AppError(ErrorCodes.INVALID_CREDENTIALS, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError(ErrorCodes.USER_INACTIVE, 'This account has been deactivated', 403);
    }

    const passwordMatches = await comparePassword(input.password, user.password);

    if (!passwordMatches) {
      throw new AppError(ErrorCodes.INVALID_CREDENTIALS, 'Invalid email or password', 401);
    }

    const userDto = toUserDto(user);
    const token = signAccessToken({
      sub: userDto._id,
      email: userDto.email,
      role: userDto.role,
    });

    return { user: userDto, token };
  },

  async getCurrentUser(userId: string): Promise<UserRecord> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
    }

    if (!user.isActive) {
      throw new AppError(ErrorCodes.USER_INACTIVE, 'This account has been deactivated', 403);
    }

    return toUserDto(user);
  },

  getCookieOptions() {
    return getAuthCookieOptions();
  },

  getClearCookieOptions() {
    return getClearAuthCookieOptions();
  },

  getCookieName(): string {
    return env.AUTH_COOKIE_NAME;
  },
};
