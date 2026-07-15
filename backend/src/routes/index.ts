import { Router } from 'express';

import commentRoutes from '@/routes/comment.routes.js';
import healthRoutes from '@/routes/health.routes.js';
import ticketRoutes from '@/routes/ticket.routes.js';
import userRoutes from '@/routes/user.routes.js';

const router = Router();

router.use(healthRoutes);
router.use(userRoutes);
router.use(ticketRoutes);
router.use(commentRoutes);

export default router;
