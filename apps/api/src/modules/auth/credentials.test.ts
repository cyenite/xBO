import { describe, expect, it } from 'vitest';
import { generateSecret, hashPassword, hashSecret, readAccessToken, secretMatchesHash, signAccessToken, verifyPassword } from './credentials';

const secret = 'a-test-token-secret-that-is-long-enough';
const machineClientId = '0b7f8a0e-6a43-4c55-9a0a-3c2d8f1b2e11';

describe('passwords', () => {
  it('verifies the password it hashed and rejects others', async () => {
    const stored = await hashPassword('correct horse');

    expect(stored.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('correct horse', stored)).toBe(true);
    expect(await verifyPassword('wrong horse', stored)).toBe(false);
  });

  it('rejects malformed stored hashes instead of throwing', async () => {
    expect(await verifyPassword('anything', 'bcrypt$whatever')).toBe(false);
  });
});

describe('secrets', () => {
  it('generates URL-safe secrets with the given prefix', () => {
    expect(generateSecret('xbo_cs')).toMatch(/^xbo_cs_[A-Za-z0-9_-]{43}$/);
  });

  it('matches a secret against its hash only', () => {
    const value = generateSecret('xbo_st');

    expect(secretMatchesHash(value, hashSecret(value))).toBe(true);
    expect(secretMatchesHash(`${value}x`, hashSecret(value))).toBe(false);
  });
});

describe('access tokens', () => {
  it('round-trips the machine client and expiry', () => {
    const expiresAt = new Date(Date.now() + 60_000);
    const claims = readAccessToken(signAccessToken({ expiresAt, machineClientId }, secret), secret);

    expect(claims?.machineClientId).toBe(machineClientId);
    expect(claims?.expiresAt.getTime()).toBe(Math.floor(expiresAt.getTime() / 1000) * 1000);
  });

  it('rejects expired, tampered and foreign tokens', () => {
    const token = signAccessToken({ expiresAt: new Date(Date.now() + 60_000), machineClientId }, secret);
    const expired = signAccessToken({ expiresAt: new Date(Date.now() - 1000), machineClientId }, secret);
    const [payload, signature] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ c: 'someone-else', e: 9_999_999_999 })).toString('base64url');

    expect(readAccessToken(expired, secret)).toBeNull();
    expect(readAccessToken(token, 'a-different-secret-of-sufficient-size')).toBeNull();
    expect(readAccessToken(`xbo_at_${forged}.${signature}`, secret)).toBeNull();
    expect(readAccessToken(`${payload}.${signature}.extra`, secret)).toBeNull();
    expect(readAccessToken('xbo_st_not-an-access-token', secret)).toBeNull();
  });
});
