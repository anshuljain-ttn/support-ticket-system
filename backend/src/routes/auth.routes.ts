import { Router } from 'express';

import { login, logout, getCurrentUser } from '@/controllers/auth.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';
import { requireAuth } from '@/middleware/require-auth.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';
import { loginSchema } from '@/validators/auth.validator.js';

const router = Router();

router.post('/auth/login', validate(loginSchema), login);
router.post('/auth/logout', authenticate, requireAuth, logout);
router.get('/auth/me', authenticate, requireAuth, getCurrentUser);

export default router;
