import { Global, Inject, Injectable, Module, type OnApplicationShutdown } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { appConfig } from '../config';
import { DATABASE } from './database';
import * as schema from './schema';

const DATABASE_POOL = Symbol('DATABASE_POOL');

@Injectable()
class DatabasePoolCloser implements OnApplicationShutdown {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}

@Global()
@Module({
  providers: [
    { provide: DATABASE_POOL, useFactory: () => new Pool({ connectionString: appConfig.databaseUrl }) },
    { provide: DATABASE, inject: [DATABASE_POOL], useFactory: (pool: Pool) => drizzle(pool, { schema, casing: 'snake_case' }) },
    DatabasePoolCloser,
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}
