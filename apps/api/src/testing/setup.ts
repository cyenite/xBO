import { inject } from 'vitest';

// Runs before each test file imports anything, so `appConfig` reads the per-run database URL.
process.env.XBO_DATABASE_URL = inject('databaseUrl');
