import { Router } from 'express';

import { getDashboardStats } from '@/controllers/dashboard.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';
import { requireAuth } from '@/middleware/require-auth.middleware.js';

const router = Router();

router.get('/dashboard/stats', authenticate, requireAuth, getDashboardStats);

export default router;
