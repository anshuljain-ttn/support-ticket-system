import mongoose, { Schema, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose';

import { UserRoles } from '@/types/user.types.js';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(UserRoles),
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

export type UserDocument = HydratedDocument<InferSchemaType<typeof userSchema>>;

export type UserModel = Model<UserDocument>;

export const User =
  (mongoose.models.User as UserModel | undefined) ??
  mongoose.model<UserDocument>('User', userSchema);
