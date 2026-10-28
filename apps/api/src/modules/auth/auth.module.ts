import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { OrganizationsModule } from '../organizations/organizations.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { MachineAuthService } from './machine-auth.service';
import { MachineClientsController } from './machine-clients.controller';
import { MachineClientsService } from './machine-clients.service';
import { SessionsService } from './sessions.service';
import { TokenController } from './token.controller';

@Module({
  imports: [OrganizationsModule],
  controllers: [AuthController, TokenController, MachineClientsController],
  providers: [SessionsService, MachineAuthService, MachineClientsService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthModule {}
