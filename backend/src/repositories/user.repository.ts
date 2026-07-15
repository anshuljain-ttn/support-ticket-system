import { User, type UserDocument } from '@/models/user.model.js';

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

  async createMany(
    users: Array<{ name: string; email: string; role: UserDocument['role'] }>,
  ): Promise<UserDocument[]> {
    return User.insertMany(users);
  },

  async deleteAll(): Promise<void> {
    await User.deleteMany({});
  },
};
