export const Roles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export const ALL_ROLES = Object.values(Roles);
