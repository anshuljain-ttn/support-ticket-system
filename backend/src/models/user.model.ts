import mongoose, { Schema, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose';

import { ALL_ROLES } from '@/constants/roles.js';

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
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: ALL_ROLES,
    },
    avatar: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

export type UserDocument = HydratedDocument<InferSchemaType<typeof userSchema>>;

export type UserModel = Model<UserDocument>;

export const User =
  (mongoose.models.User as UserModel | undefined) ??
  mongoose.model<UserDocument>('User', userSchema);
