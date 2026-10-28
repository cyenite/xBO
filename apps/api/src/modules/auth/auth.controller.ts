import { Body, Controller, Get, HttpCode, Post, Put, Req, Res, UnauthorizedException } from '@nestjs/common';
import {
  loginRequestSchema,
  switchOrganizationRequestSchema,
  type LoginRequest,
  type PrincipalResponse,
  type SessionResponse,
  type SwitchOrganizationRequest,
} from '@xbo/contracts';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { authConfig } from '../../config';
import { AllowPrincipals, CurrentPrincipal, Public } from './auth.decorators';
import type { Principal, UserPrincipal } from './principal';
import { SessionsService } from './sessions.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly sessions: SessionsService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(loginRequestSchema)) body: LoginRequest,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<SessionResponse> {
    const started = await this.sessions.login(body, { userAgent: request.headers['user-agent'], ipAddress: request.ip });

    if (!started) throw new UnauthorizedException('The email or password is incorrect.');

    reply.setCookie(authConfig.sessionCookieName, started.token, {
      path: '/',
      expires: started.expiresAt,
      secure: authConfig.isSessionCookieSecure,
      httpOnly: true,
      sameSite: 'lax',
    });

    return this.sessions.describe(started.principal);
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@CurrentPrincipal() principal: UserPrincipal, @Res({ passthrough: true }) reply: FastifyReply): Promise<void> {
    await this.sessions.revoke(principal.sessionId);

    reply.clearCookie(authConfig.sessionCookieName, { path: '/' });
  }

  @Get('session')
  session(@CurrentPrincipal() principal: UserPrincipal): Promise<SessionResponse> {
    return this.sessions.describe(principal);
  }

  @Put('session/organization')
  async switchOrganization(
    @CurrentPrincipal() principal: UserPrincipal,
    @Body(new ZodValidationPipe(switchOrganizationRequestSchema)) body: SwitchOrganizationRequest,
  ): Promise<SessionResponse> {
    return this.sessions.describe(await this.sessions.switchOrganization(principal, body.organizationId));
  }

  @Get('principal')
  @AllowPrincipals('user', 'machine')
  principal(@CurrentPrincipal() principal: Principal): PrincipalResponse {
    if (principal.kind === 'user') return { kind: 'user', userId: principal.userId, organizationId: principal.organizationId };

    return { kind: 'machine', scheme: principal.scheme, organizationId: principal.organizationId, machineClientId: principal.machineClientId };
  }
}
