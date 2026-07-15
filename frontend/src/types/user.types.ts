export const UserRoles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

export type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  isActive: boolean;
  createdAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: User;
};
