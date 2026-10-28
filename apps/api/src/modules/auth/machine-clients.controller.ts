import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  createMachineClientRequestSchema,
  createMachineClientTokenRequestSchema,
  type CreatedMachineClientResponse,
  type CreatedMachineClientTokenResponse,
  type CreateMachineClientRequest,
  type CreateMachineClientTokenRequest,
  type MachineClient,
  type MachineClientToken,
} from '@xbo/contracts';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CurrentTenant, type Tenant } from '../../tenancy/tenant';
import { MachineClientsService } from './machine-clients.service';

@Controller('machine-clients')
export class MachineClientsController {
  constructor(private readonly machineClients: MachineClientsService) {}

  @Get()
  list(@CurrentTenant() tenant: Tenant): Promise<MachineClient[]> {
    return this.machineClients.list(tenant);
  }

  @Post()
  create(
    @CurrentTenant() tenant: Tenant,
    @Body(new ZodValidationPipe(createMachineClientRequestSchema)) body: CreateMachineClientRequest,
  ): Promise<CreatedMachineClientResponse> {
    return this.machineClients.create(tenant, body.name);
  }

  @Delete(':id')
  @HttpCode(204)
  revoke(@CurrentTenant() tenant: Tenant, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.machineClients.revoke(tenant, id);
  }

  @Get(':id/tokens')
  listTokens(@CurrentTenant() tenant: Tenant, @Param('id', ParseUUIDPipe) id: string): Promise<MachineClientToken[]> {
    return this.machineClients.listTokens(tenant, id);
  }

  @Post(':id/tokens')
  createToken(
    @CurrentTenant() tenant: Tenant,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(createMachineClientTokenRequestSchema)) body: CreateMachineClientTokenRequest,
  ): Promise<CreatedMachineClientTokenResponse> {
    return this.machineClients.createToken(tenant, id, body.name);
  }

  @Delete(':id/tokens/:tokenId')
  @HttpCode(204)
  revokeToken(
    @CurrentTenant() tenant: Tenant,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('tokenId', ParseUUIDPipe) tokenId: string,
  ): Promise<void> {
    return this.machineClients.revokeToken(tenant, id, tokenId);
  }
}
