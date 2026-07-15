import { Router } from 'express';

import authRoutes from '@/routes/auth.routes.js';
import dashboardRoutes from '@/routes/dashboard.routes.js';
import healthRoutes from '@/routes/health.routes.js';
import ticketRoutes from '@/routes/ticket.routes.js';
import userRoutes from '@/routes/user.routes.js';

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(dashboardRoutes);
router.use(userRoutes);
router.use('/tickets', ticketRoutes);

export default router;
