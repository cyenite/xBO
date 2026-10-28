import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

export const secretPrefixes = {
  clientId: 'xbo_ci',
  accessToken: 'xbo_at',
  staticToken: 'xbo_st',
  clientSecret: 'xbo_cs',
} as const;

const passwordKeyLength = 64;
const passwordParameters = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;

// base64url keeps secrets free of `+`, `/` and `=`, because some clients interpolate them unescaped into form bodies.
export function generateSecret(prefix: string, bytes = 32): string {
  return `${prefix}_${randomBytes(bytes).toString('base64url')}`;
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

// Generated secrets carry 256 bits of entropy, so a fast hash is enough and keeps per-request basic auth cheap.
export function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export function secretMatchesHash(secret: string, hash: string): boolean {
  const actual = Buffer.from(hashSecret(secret), 'hex');
  const expected = Buffer.from(hash, 'hex');

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function deriveKey(password: string, salt: Buffer, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize('NFKC'), salt, passwordKeyLength, options, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt, passwordParameters);
  const { N, r, p } = passwordParameters;

  return ['scrypt', N, r, p, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, cost, blockSize, parallelism, salt, hash] = stored.split('$');

  if (algorithm !== 'scrypt' || !cost || !blockSize || !parallelism || !salt || !hash) return false;

  const expected = Buffer.from(hash, 'base64');
  const options = { N: Number(cost), r: Number(blockSize), p: Number(parallelism), maxmem: passwordParameters.maxmem };
  const actual = await deriveKey(password, Buffer.from(salt, 'base64'), options);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export interface AccessTokenClaims {
  readonly expiresAt: Date;
  readonly machineClientId: string;
}

function sign(payload: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(payload).digest();
}

// Some clients fetch a fresh token before every call, so access tokens are signed rather than stored to avoid a row per request.
export function signAccessToken(claims: AccessTokenClaims, secret: string): string {
  const payload = Buffer.from(JSON.stringify({ c: claims.machineClientId, e: Math.floor(claims.expiresAt.getTime() / 1000) })).toString('base64url');

  return `${secretPrefixes.accessToken}_${payload}.${sign(payload, secret).toString('base64url')}`;
}

export function readAccessToken(token: string, secret: string, now = new Date()): AccessTokenClaims | null {
  const prefix = `${secretPrefixes.accessToken}_`;

  if (!token.startsWith(prefix)) return null;

  const [payload, signature, ...rest] = token.slice(prefix.length).split('.');

  if (!payload || !signature || rest.length > 0) return null;

  const actual = Buffer.from(signature, 'base64url');
  const expected = sign(payload, secret);

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  const claims: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));

  if (typeof claims !== 'object' || claims === null || !('c' in claims) || !('e' in claims)) return null;
  if (typeof claims.c !== 'string' || typeof claims.e !== 'number') return null;

  const expiresAt = new Date(claims.e * 1000);

  return expiresAt > now ? { expiresAt, machineClientId: claims.c } : null;
}
