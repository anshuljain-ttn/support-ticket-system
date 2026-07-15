import { Router } from 'express';

import { listUsers } from '@/controllers/user.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';
import { requireAuth } from '@/middleware/require-auth.middleware.js';

const router = Router();

router.get('/users', authenticate, requireAuth, listUsers);

export default router;
