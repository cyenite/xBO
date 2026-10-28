import { Body, Controller, Get, Post } from '@nestjs/common';
import { createOrganizationRequestSchema, type CreateOrganizationRequest, type OrganizationSummary } from '@xbo/contracts';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CurrentPrincipal } from '../auth/auth.decorators';
import type { UserPrincipal } from '../auth/principal';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}

  @Get()
  list(@CurrentPrincipal() principal: UserPrincipal): Promise<OrganizationSummary[]> {
    return this.organizations.listForUser(principal.userId);
  }

  @Post()
  create(
    @CurrentPrincipal() principal: UserPrincipal,
    @Body(new ZodValidationPipe(createOrganizationRequestSchema)) body: CreateOrganizationRequest,
  ): Promise<OrganizationSummary> {
    return this.organizations.createForUser(principal.userId, body);
  }
}
