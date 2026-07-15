import cors from 'cors';
import express from 'express';

import { env } from '@/config/env.js';
import { errorHandler } from '@/middleware/error.middleware.js';
import { requestLogger } from '@/middleware/logger.middleware.js';
import { notFoundHandler } from '@/middleware/not-found.middleware.js';
import routes from '@/routes/index.js';

export function createApp(): express.Application {
  const app = express();

  app.use(requestLogger);
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());
  app.use(routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
