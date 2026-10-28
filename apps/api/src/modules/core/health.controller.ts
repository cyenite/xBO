import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@xbo/contracts';
import { appConfig } from '../../config';
import { Public } from '../auth/auth.decorators';

@Public()
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
