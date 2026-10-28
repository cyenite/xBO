import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { LoginRequest, SessionResponse } from '@xbo/contracts';
import { and, eq, gt, isNull, lt, or } from 'drizzle-orm';
import { authConfig } from '../../config';
import { DATABASE, type Database } from '../../database/database';
import { sessions, users } from '../../database/schema';
import { OrganizationsService } from '../organizations/organizations.service';
import { generateSessionToken, hashPassword, hashSecret, verifyPassword } from './credentials';
import type { UserPrincipal } from './principal';

const touchIntervalMs = 5 * 60 * 1000;

export interface SessionClient {
  readonly userAgent?: string;
  readonly ipAddress?: string;
}

export interface StartedSession {
  readonly token: string;
  readonly expiresAt: Date;
  readonly principal: UserPrincipal;
}

@Injectable()
export class SessionsService {
  // Verifying against a throwaway hash when the email is unknown keeps login timing from revealing which emails exist.
  private decoyHash?: Promise<string>;

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly organizations: OrganizationsService,
  ) {}

  async login(request: LoginRequest, client: SessionClient): Promise<StartedSession | null> {
    const [user] = await this.db.select().from(users).where(eq(users.email, request.email));

    if (!user) {
      this.decoyHash ??= hashPassword('decoy-password');
      await verifyPassword(request.password, await this.decoyHash);

      return null;
    }

    if (!(await verifyPassword(request.password, user.passwordHash)) || !user.isActive) return null;

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + authConfig.sessionTtlHours * 3600 * 1000);
    const memberOf = await this.organizations.listForUser(user.id);
    const organizationId = memberOf.length === 1 ? memberOf[0]!.id : null;
    const [session] = await this.db
      .insert(sessions)
      .values({ userId: user.id, tokenHash: hashSecret(token), userAgent: client.userAgent, ipAddress: client.ipAddress, expiresAt, organizationId })
      .returning({ id: sessions.id });

    await this.db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    return { token, expiresAt, principal: { kind: 'user', userId: user.id, sessionId: session!.id, organizationId } };
  }

  async resolve(token: string): Promise<UserPrincipal | null> {
    const now = new Date();
    const [session] = await this.db
      .select({ id: sessions.id, userId: sessions.userId, organizationId: sessions.organizationId })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.tokenHash, hashSecret(token)), gt(sessions.expiresAt, now), eq(users.isActive, true)));

    if (!session) return null;

    await this.db
      .update(sessions)
      .set({ lastSeenAt: now })
      .where(and(eq(sessions.id, session.id), or(isNull(sessions.lastSeenAt), lt(sessions.lastSeenAt, new Date(now.getTime() - touchIntervalMs)))));

    return { kind: 'user', userId: session.userId, sessionId: session.id, organizationId: session.organizationId };
  }

  async revoke(sessionId: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async describe(principal: UserPrincipal): Promise<SessionResponse> {
    const [user] = await this.db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, principal.userId));

    if (!user) throw new UnauthorizedException();

    const organizations = await this.organizations.listForUser(user.id);
    const organization = organizations.find((candidate) => candidate.id === principal.organizationId) ?? null;

    return { user, organization, organizations };
  }

  async switchOrganization(principal: UserPrincipal, organizationId: string): Promise<UserPrincipal> {
    const organization = await this.organizations.findForUser(principal.userId, organizationId);

    if (!organization) throw new ForbiddenException('You are not a member of that organisation.');

    await this.db.update(sessions).set({ organizationId }).where(eq(sessions.id, principal.sessionId));

    return { ...principal, organizationId };
  }
}
