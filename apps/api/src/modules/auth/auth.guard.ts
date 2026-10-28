import { ForbiddenException, Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { authConfig } from '../../config';
import { ALLOWED_PRINCIPALS, IS_PUBLIC } from './auth.decorators';
import { MachineAuthService } from './machine-auth.service';
import { readMachineCredentials } from './machine-credentials';
import type { Principal, PrincipalKind } from './principal';
import { SessionsService } from './sessions.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessions: SessionsService,
    private readonly machineAuth: MachineAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];

    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, targets)) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const principal = await this.authenticate(request);

    if (!principal) throw new UnauthorizedException();

    const allowed = this.reflector.getAllAndOverride<PrincipalKind[]>(ALLOWED_PRINCIPALS, targets) ?? ['user'];

    if (!allowed.includes(principal.kind)) throw new ForbiddenException();

    request.principal = principal;

    return true;
  }

  // Presented machine credentials win over a cookie, and a bad credential fails rather than falling back to the session.
  private async authenticate(request: FastifyRequest): Promise<Principal | null> {
    const credentials = readMachineCredentials(request.headers);

    if (credentials) return this.machineAuth.authenticate(credentials);

    const token = request.cookies[authConfig.sessionCookieName];

    return token ? this.sessions.resolve(token) : null;
  }
}
