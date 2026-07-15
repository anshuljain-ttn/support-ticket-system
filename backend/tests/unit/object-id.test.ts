import { describe, expect, it } from 'vitest';

import { isValidObjectId } from '@/utils/object-id.js';

describe('isValidObjectId', () => {
  it('returns true for valid ObjectIds', () => {
    expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
  });

  it('returns false for invalid ObjectIds', () => {
    expect(isValidObjectId('not-an-id')).toBe(false);
    expect(isValidObjectId('123')).toBe(false);
  });
});
