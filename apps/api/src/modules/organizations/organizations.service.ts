import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { CreateOrganizationRequest, OrganizationSummary } from '@xbo/contracts';
import { and, asc, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database';
import { memberships, organizations } from '../../database/schema';

const summaryColumns = { id: organizations.id, code: organizations.code, name: organizations.name };

@Injectable()
export class OrganizationsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  listForUser(userId: string): Promise<OrganizationSummary[]> {
    return this.db
      .select(summaryColumns)
      .from(memberships)
      .innerJoin(organizations, eq(organizations.id, memberships.organizationId))
      .where(eq(memberships.userId, userId))
      .orderBy(asc(organizations.name));
  }

  async findForUser(userId: string, organizationId: string): Promise<OrganizationSummary | null> {
    const [organization] = await this.db
      .select(summaryColumns)
      .from(memberships)
      .innerJoin(organizations, eq(organizations.id, memberships.organizationId))
      .where(and(eq(memberships.userId, userId), eq(memberships.organizationId, organizationId)));

    return organization ?? null;
  }

  createForUser(userId: string, request: CreateOrganizationRequest): Promise<OrganizationSummary> {
    return this.db.transaction(async (transaction) => {
      const [organization] = await transaction
        .insert(organizations)
        .values({ code: request.code, name: request.name })
        .onConflictDoNothing({ target: organizations.code })
        .returning(summaryColumns);

      if (!organization) throw new ConflictException(`An organisation with code ${request.code} already exists.`);

      await transaction.insert(memberships).values({ userId, organizationId: organization.id });

      return organization;
    });
  }
}
