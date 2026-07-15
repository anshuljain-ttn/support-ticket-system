import { Router } from 'express';

import healthRoutes from '@/routes/health.routes.js';
import userRoutes from '@/routes/user.routes.js';

const router = Router();

router.use(healthRoutes);
router.use(userRoutes);

export default router;
