import { createServer } from 'node:http';

import { createApp } from '@/app.js';
import { connectDatabase, disconnectDatabase } from '@/config/database.js';
import { env } from '@/config/env.js';

async function start(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.info(`[server] Listening on port ${env.PORT}`);
  });

  const shutdown = (signal: string): void => {
    console.info(`[server] Received ${signal}, shutting down gracefully`);

    server.close(() => {
      void disconnectDatabase().then(() => {
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
}

start().catch((error: unknown) => {
  console.error('[server] Failed to start', error);
  process.exit(1);
});
