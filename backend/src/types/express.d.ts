import type { UserRecord } from '@/types/user.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: UserRecord;
    }
  }
}

export {};
