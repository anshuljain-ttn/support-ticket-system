import { User, type UserDocument } from '@/models/user.model.js';
import type { UserRole } from '@/types/user.types.js';

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string;
  isActive?: boolean;
};

export const userRepository = {
  async findAll(): Promise<UserDocument[]> {
    return User.find().sort({ name: 1 }).exec();
  },

  async findById(id: string): Promise<UserDocument | null> {
    return User.findById(id).exec();
  },

  async findByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email: email.toLowerCase() }).exec();
  },

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return User.findOne({ email: email.toLowerCase() }).select('+password').exec();
  },

  async createMany(users: CreateUserInput[]): Promise<UserDocument[]> {
    const docs = await User.insertMany(users);
    return docs as UserDocument[];
  },

  async deleteAll(): Promise<void> {
    await User.deleteMany({});
  },
};
