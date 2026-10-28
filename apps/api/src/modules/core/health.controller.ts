import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@xbo/contracts';
import { appConfig } from '../../config';

@Controller('health')
export class HealthController {
  @Get()
  check(): HealthResponse {
    return {
      app: appConfig.name,
      time: new Date().toISOString(),
      status: 'ok',
      version: appConfig.version,
    };
  }
}
