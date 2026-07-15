import type { NextFunction, Request, Response } from 'express';

import { env } from '@/config/env.js';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    if (env.LOG_LEVEL === 'debug') {
      console.debug(`[http] ${message}`);
      return;
    }

    if (res.statusCode >= 500) {
      console.error(`[http] ${message}`);
      return;
    }

    if (res.statusCode >= 400) {
      console.warn(`[http] ${message}`);
      return;
    }

    console.info(`[http] ${message}`);
  });

  next();
}
