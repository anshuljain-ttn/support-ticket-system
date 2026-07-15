import mongoose from 'mongoose';

import { env } from '@/config/env.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectDatabase(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.info('[database] Connected to MongoDB');
      return;
    } catch (error) {
      console.error(`[database] Connection attempt ${attempt}/${MAX_RETRIES} failed`, error);

      if (attempt >= MAX_RETRIES) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.info('[database] Disconnected from MongoDB');
}
