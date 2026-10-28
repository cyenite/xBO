import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CreatedMachineClientResponse, CreatedMachineClientTokenResponse, MachineClient, MachineClientToken } from '@xbo/contracts';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database';
import { machineClients, machineClientTokens } from '../../database/schema';
import { inTenant, type Tenant } from '../../tenancy/tenant';
import { generateSecret, hashSecret, secretPrefixes } from './credentials';

type MachineClientRow = typeof machineClients.$inferSelect;
type MachineClientTokenRow = typeof machineClientTokens.$inferSelect;

function toMachineClient(row: MachineClientRow): MachineClient {
  return {
    id: row.id,
    name: row.name,
    clientId: row.clientId,
    createdAt: row.createdAt.toISOString(),
    revokedAt: row.revokedAt?.toISOString() ?? null,
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
  };
}

function toMachineClientToken(row: MachineClientTokenRow): MachineClientToken {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
    revokedAt: row.revokedAt?.toISOString() ?? null,
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
  };
}

@Injectable()
export class MachineClientsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(tenant: Tenant): Promise<MachineClient[]> {
    const rows = await this.db.select().from(machineClients).where(inTenant(machineClients.organizationId, tenant)).orderBy(asc(machineClients.name));

    return rows.map(toMachineClient);
  }

  async create(tenant: Tenant, name: string): Promise<CreatedMachineClientResponse> {
    const clientSecret = generateSecret(secretPrefixes.clientSecret);
    const [row] = await this.db
      .insert(machineClients)
      .values({
        name,
        clientId: generateSecret(secretPrefixes.clientId, 12),
        secretHash: hashSecret(clientSecret),
        organizationId: tenant.organizationId,
      })
      .returning();

    return { client: toMachineClient(row!), clientSecret };
  }

  async revoke(tenant: Tenant, id: string): Promise<void> {
    const [row] = await this.db
      .update(machineClients)
      .set({ revokedAt: new Date() })
      .where(and(inTenant(machineClients.organizationId, tenant), eq(machineClients.id, id), isNull(machineClients.revokedAt)))
      .returning({ id: machineClients.id });

    if (!row) throw new NotFoundException('Machine client not found.');
  }

  async listTokens(tenant: Tenant, machineClientId: string): Promise<MachineClientToken[]> {
    await this.findActive(tenant, machineClientId);

    const rows = await this.db
      .select()
      .from(machineClientTokens)
      .where(and(inTenant(machineClientTokens.organizationId, tenant), eq(machineClientTokens.machineClientId, machineClientId)))
      .orderBy(asc(machineClientTokens.createdAt));

    return rows.map(toMachineClientToken);
  }

  async createToken(tenant: Tenant, machineClientId: string, name: string): Promise<CreatedMachineClientTokenResponse> {
    await this.findActive(tenant, machineClientId);

    const tokenSecret = generateSecret(secretPrefixes.staticToken);
    const [row] = await this.db
      .insert(machineClientTokens)
      .values({ name, tokenHash: hashSecret(tokenSecret), organizationId: tenant.organizationId, machineClientId })
      .returning();

    return { token: toMachineClientToken(row!), tokenSecret };
  }

  async revokeToken(tenant: Tenant, machineClientId: string, tokenId: string): Promise<void> {
    const [row] = await this.db
      .update(machineClientTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          inTenant(machineClientTokens.organizationId, tenant),
          eq(machineClientTokens.id, tokenId),
          eq(machineClientTokens.machineClientId, machineClientId),
          isNull(machineClientTokens.revokedAt),
        ),
      )
      .returning({ id: machineClientTokens.id });

    if (!row) throw new NotFoundException('Token not found.');
  }

  private async findActive(tenant: Tenant, id: string): Promise<MachineClientRow> {
    const [row] = await this.db
      .select()
      .from(machineClients)
      .where(and(inTenant(machineClients.organizationId, tenant), eq(machineClients.id, id), isNull(machineClients.revokedAt)));

    if (!row) throw new NotFoundException('Machine client not found.');

    return row;
  }
}
