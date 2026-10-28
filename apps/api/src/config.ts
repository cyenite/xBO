export const appConfig = {
  name: process.env.XBO_APP_NAME ?? 'xBO',
  port: Number(process.env.XBO_API_PORT ?? 3000),
  version: process.env.XBO_VERSION ?? '0.1.0',
  corsOrigins: (process.env.XBO_CORS_ORIGINS ?? 'http://localhost:5190,tauri://localhost,http://tauri.localhost').split(','),
} as const;
