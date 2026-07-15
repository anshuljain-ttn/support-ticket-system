export const UserRoles = {
  EMPLOYEE: 'employee',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

export type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
};
