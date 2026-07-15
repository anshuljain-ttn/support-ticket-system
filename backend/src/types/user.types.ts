import { Roles, type Role } from '@/constants/roles.js';

export const UserRoles = Roles;

export type UserRole = Role;

export type UserRecord = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  isActive: boolean;
  createdAt: string;
};

export type SeedUser = {
  name: string;
  email: string;
  role: UserRole;
};

export type AuthenticatedUser = UserRecord;
