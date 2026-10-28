import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull, lt, or } from 'drizzle-orm';
import { authConfig, resolveTokenSecret } from '../../config';
import { DATABASE, type Database } from '../../database/database';
import { machineClients, machineClientTokens, type MachineClient } from '../../database/schema';
import { hashSecret, readAccessToken, secretMatchesHash, secretPrefixes, signAccessToken } from './credentials';
import type { MachineCredentials } from './machine-credentials';
import type { MachinePrincipal } from './principal';

const touchIntervalMs = 5 * 60 * 1000;

export interface IssuedAccessToken {
  readonly token: string;
  readonly expiresIn: number;
}

@Injectable()
export class MachineAuthService {
  private readonly tokenSecret = resolveTokenSecret();

  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async authenticate(credentials: MachineCredentials): Promise<MachinePrincipal | null> {
    const client =
      credentials.scheme === 'basic'
        ? await this.authenticateClient(credentials.clientId, credentials.clientSecret)
        : await this.authenticateToken(credentials.token);

    if (!client) return null;

    return { kind: 'machine', scheme: credentials.scheme, organizationId: client.organizationId, machineClientId: client.id };
  }

  async authenticateClient(clientId: string, clientSecret: string): Promise<MachineClient | null> {
    const [client] = await this.db
      .select()
      .from(machineClients)
      .where(and(eq(machineClients.clientId, clientId), isNull(machineClients.revokedAt)));

    if (!client || !secretMatchesHash(clientSecret, client.secretHash)) return null;

    await this.touchClient(client.id);

    return client;
  }

  issueAccessToken(client: MachineClient): IssuedAccessToken {
    const expiresIn = authConfig.accessTokenTtlSeconds;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return { token: signAccessToken({ expiresAt, machineClientId: client.id }, this.tokenSecret), expiresIn };
  }

  private async authenticateToken(token: string): Promise<MachineClient | null> {
    const claims = readAccessToken(token, this.tokenSecret);

    if (claims) return this.findActiveClient(claims.machineClientId);
    if (!token.startsWith(`${secretPrefixes.staticToken}_`)) return null;

    const [row] = await this.db
      .select({ client: machineClients, tokenId: machineClientTokens.id })
      .from(machineClientTokens)
      .innerJoin(machineClients, eq(machineClients.id, machineClientTokens.machineClientId))
      .where(and(eq(machineClientTokens.tokenHash, hashSecret(token)), isNull(machineClientTokens.revokedAt), isNull(machineClients.revokedAt)));

    if (!row) return null;

    await this.db
      .update(machineClientTokens)
      .set({ lastUsedAt: new Date() })
      .where(and(eq(machineClientTokens.id, row.tokenId), this.isStale(machineClientTokens.lastUsedAt)));
    await this.touchClient(row.client.id);

    return row.client;
  }

  private async findActiveClient(id: string): Promise<MachineClient | null> {
    const [client] = await this.db
      .select()
      .from(machineClients)
      .where(and(eq(machineClients.id, id), isNull(machineClients.revokedAt)));

    if (!client) return null;

    await this.touchClient(client.id);

    return client;
  }

  // Throttled so a busy integration does not turn every request into a write.
  private async touchClient(id: string): Promise<void> {
    await this.db
      .update(machineClients)
      .set({ lastUsedAt: new Date() })
      .where(and(eq(machineClients.id, id), this.isStale(machineClients.lastUsedAt)));
  }

  private isStale(column: typeof machineClients.lastUsedAt | typeof machineClientTokens.lastUsedAt) {
    return or(isNull(column), lt(column, new Date(Date.now() - touchIntervalMs)));
  }
}
