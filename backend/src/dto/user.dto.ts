import type { UserDocument } from '@/models/user.model.js';
import type { UserRecord } from '@/types/user.types.js';

export function toUserDto(user: UserDocument): UserRecord {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toUserDtoList(users: UserDocument[]): UserRecord[] {
  return users.map(toUserDto);
}
