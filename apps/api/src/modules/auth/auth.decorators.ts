import { createParamDecorator, SetMetadata, UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { Principal, PrincipalKind } from './principal';

export const IS_PUBLIC = Symbol('IS_PUBLIC');
export const ALLOWED_PRINCIPALS = Symbol('ALLOWED_PRINCIPALS');

export const Public = () => SetMetadata(IS_PUBLIC, true);

// Routes accept signed-in users only unless they opt machine clients in.
export const AllowPrincipals = (...kinds: PrincipalKind[]) => SetMetadata(ALLOWED_PRINCIPALS, kinds);

export const CurrentPrincipal = createParamDecorator((_: unknown, context: ExecutionContext): Principal => {
  const principal = context.switchToHttp().getRequest<FastifyRequest>().principal;

  if (!principal) throw new UnauthorizedException();

  return principal;
});
