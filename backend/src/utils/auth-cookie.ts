import type { CookieOptions } from 'express';

import { env } from '@/config/env.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function getAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    maxAge: SEVEN_DAYS_MS,
    path: '/',
  };
}

export function getClearAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
  };
}
