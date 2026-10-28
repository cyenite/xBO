import 'reflect-metadata';
import { createApp } from './bootstrap';
import { appConfig } from './config';

async function main(): Promise<void> {
  const app = await createApp();

  await app.listen({ port: appConfig.port, host: '0.0.0.0' });
}

void main();
