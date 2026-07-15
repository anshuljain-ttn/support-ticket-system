import { describe, expect, it } from 'vitest';

import { comparePassword, hashPassword } from '@/utils/password.js';

describe('password utils', () => {
  it('hashes and verifies passwords', async () => {
    const hash = await hashPassword('Password123!');
    expect(hash).not.toBe('Password123!');
    await expect(comparePassword('Password123!', hash)).resolves.toBe(true);
    await expect(comparePassword('wrong-password', hash)).resolves.toBe(false);
  });
});
