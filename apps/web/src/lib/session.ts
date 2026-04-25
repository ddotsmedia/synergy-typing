// Lightweight cookie-stub session for Phase 1.
//
// Customer signs in with email + an application reference; we set a signed
// cookie containing the customer ID. Server components/actions verify and
// resolve the customer on each request via the JSON store.
//
// When STEP 6 ships proper Auth.js + magic-link email, swap the body of
// getSession() for the Auth.js session lookup — call sites don't change.

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { getCustomer } from '@synergy/db';
import type { Customer } from '@synergy/db/types';

const COOKIE_NAME = 'synergy_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  // SYNERGY_AUTH_SECRET should be set in production. In dev (no env var) we
  // fall back to a deterministic dev secret so cookies persist across
  // restarts but obviously aren't safe for production deploys.
  return (
    process.env.SYNERGY_AUTH_SECRET ||
    'dev-only-DO-NOT-USE-IN-PROD-' + (process.env.NODE_ENV ?? 'dev')
  );
}

function sign(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

function verify(value: string, sig: string): boolean {
  const expected = sign(value);
  if (expected.length !== sig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

export type Session = { customerId: string };

/**
 * Resolve the current session from the request cookies. Returns the
 * matching Customer or null. Verifies the HMAC signature so a stolen
 * cookie body alone can't spoof another customer.
 */
export async function getSession(): Promise<{ session: Session; customer: Customer } | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const dot = raw.lastIndexOf('.');
  if (dot < 1) return null;
  const value = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (!verify(value, sig)) return null;
  const customer = getCustomer(value);
  if (!customer) return null;
  return { session: { customerId: value }, customer };
}

export async function setSession(customerId: string): Promise<void> {
  const jar = await cookies();
  const value = customerId;
  const cookie = `${value}.${sign(value)}`;
  jar.set(COOKIE_NAME, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

/**
 * Generate a fresh secret (use once: `node -e "require('crypto').randomBytes(32).toString('base64url')"`).
 */
export function generateSecret(): string {
  return randomBytes(32).toString('base64url');
}
