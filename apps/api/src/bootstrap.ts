import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { appConfig } from './config';

export async function createApp(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), { logger: ['error', 'warn', 'log'] });

  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: [...appConfig.corsOrigins], credentials: true });

  return app;
}
