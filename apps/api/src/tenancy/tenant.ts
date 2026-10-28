import { createParamDecorator, ForbiddenException, UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { eq, type SQL } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import type { FastifyRequest } from 'fastify';

export interface Tenant {
  readonly organizationId: string;
}

// The only way a handler learns which organisation it works for; it comes from the session or machine client, never the payload.
export const CurrentTenant = createParamDecorator((_: unknown, context: ExecutionContext): Tenant => {
  const principal = context.switchToHttp().getRequest<FastifyRequest>().principal;

  if (!principal) throw new UnauthorizedException();
  if (!principal.organizationId) throw new ForbiddenException('Select an organisation first.');

  return { organizationId: principal.organizationId };
});

export function inTenant(column: AnyPgColumn, tenant: Tenant): SQL {
  return eq(column, tenant.organizationId);
}
