import { defineConfig } from 'drizzle-kit';
import { appConfig } from './src/config';

export default defineConfig({
  out: './drizzle',
  schema: './src/database/schema/index.ts',
  casing: 'snake_case',
  dialect: 'postgresql',
  dbCredentials: { url: appConfig.databaseUrl },
});
