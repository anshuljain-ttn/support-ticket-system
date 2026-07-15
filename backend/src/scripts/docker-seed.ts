import { connectDatabase, disconnectDatabase } from '@/config/database.js';
import { userRepository } from '@/repositories/user.repository.js';
import { userService } from '@/services/user.service.js';

async function runDockerSeed(): Promise<void> {
  await connectDatabase();

  const existingUsers = await userRepository.findAll();

  if (existingUsers.length > 0) {
    console.info(`[seed] Skipping seed — ${existingUsers.length} users already exist`);
  } else {
    const users = await userService.seedUsers();
    console.info(`[seed] Created ${users.length} users`);
  }

  await disconnectDatabase();
}

runDockerSeed().catch((error: unknown) => {
  console.error('[seed] Failed to seed users', error);
  process.exit(1);
});
