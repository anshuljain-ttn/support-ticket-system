import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { env } from '@/config/env.js';
import { swaggerSpec } from '@/config/swagger.js';
import { errorHandler } from '@/middleware/error.middleware.js';
import { requestLogger } from '@/middleware/logger.middleware.js';
import { notFoundHandler } from '@/middleware/not-found.middleware.js';
import routes from '@/routes/index.js';

export function createApp(): express.Application {
  const app = express();

  app.use(requestLogger);
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (_req, res) => {
    res.json(swaggerSpec);
  });
  app.use(routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
