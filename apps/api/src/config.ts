const isProduction = process.env.NODE_ENV === 'production';

export const appConfig = {
  name: process.env.XBO_APP_NAME ?? 'xBO',
  port: Number(process.env.XBO_API_PORT ?? 3000),
  version: process.env.XBO_VERSION ?? '0.1.0',
  databaseUrl: process.env.XBO_DATABASE_URL ?? 'postgres://xbo:xbo@localhost:5433/xbo',
  corsOrigins: (process.env.XBO_CORS_ORIGINS ?? 'http://localhost:5190,tauri://localhost,http://tauri.localhost').split(','),
} as const;

export const authConfig = {
  tokenSecret: process.env.XBO_TOKEN_SECRET ?? '',
  sessionTtlHours: Number(process.env.XBO_SESSION_TTL_HOURS ?? 24 * 14),
  accessTokenTtlSeconds: Number(process.env.XBO_ACCESS_TOKEN_TTL_SECONDS ?? 3600),
  sessionCookieName: 'xbo_session',
  isSessionCookieSecure: (process.env.XBO_SESSION_COOKIE_SECURE ?? String(isProduction)) === 'true',
} as const;

const developmentTokenSecret = 'xbo-development-token-secret-not-for-production';

// Access tokens are HMAC-signed with this secret; a production server must never fall back to the public development value.
export function resolveTokenSecret(): string {
  const secret = authConfig.tokenSecret;

  if (secret === '' && !isProduction) return developmentTokenSecret;
  if (secret.length < 32) throw new Error('XBO_TOKEN_SECRET must be at least 32 characters (it is required in production).');

  return secret;
}
