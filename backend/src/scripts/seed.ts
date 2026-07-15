import { connectDatabase, disconnectDatabase } from '@/config/database.js';
import { userService } from '@/services/user.service.js';

async function runSeed(): Promise<void> {
  await connectDatabase();
  const users = await userService.seedUsers();
  console.info(`[seed] Created ${users.length} users`);
  await disconnectDatabase();
}

runSeed().catch((error: unknown) => {
  console.error('[seed] Failed to seed users', error);
  process.exit(1);
});
