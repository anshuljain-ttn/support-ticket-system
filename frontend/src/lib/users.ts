import type { User } from '@/types/user.types';
import { UserRoles } from '@/types/user.types';

export function filterAssignableUsers(users: User[]): User[] {
  return users.filter(
    (user) => user.role === UserRoles.ADMIN || user.role === UserRoles.SUPER_ADMIN,
  );
}
