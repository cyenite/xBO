import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createdMachineClientResponseSchema, machineClientSchema } from '@xbo/contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createOrganization, createTestApp, createUser, login } from '../testing/test-app';

describe('tenancy', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('refuses tenant-scoped routes until the user selects an organisation', async () => {
    const user = await createUser(app);

    await createOrganization(app, user);
    await createOrganization(app, user);

    const response = await app.inject({ method: 'GET', url: '/api/v1/machine-clients', headers: { cookie: await login(app, user) } });

    expect(response.statusCode).toBe(403);
  });

  it('never shows or changes another organisation’s records', async () => {
    const owner = await createUser(app);
    const outsider = await createUser(app);

    await createOrganization(app, owner);
    await createOrganization(app, outsider);

    const ownerCookie = await login(app, owner);
    const outsiderCookie = await login(app, outsider);
    const created = await app.inject({ method: 'POST', url: '/api/v1/machine-clients', headers: { cookie: ownerCookie }, payload: { name: 'Owner client' } });
    const { client } = createdMachineClientResponseSchema.parse(created.json());
    const outsiderList = await app.inject({ method: 'GET', url: '/api/v1/machine-clients', headers: { cookie: outsiderCookie } });
    const revoke = await app.inject({ method: 'DELETE', url: `/api/v1/machine-clients/${client.id}`, headers: { cookie: outsiderCookie } });
    const issue = await app.inject({ method: 'POST', url: `/api/v1/machine-clients/${client.id}/tokens`, headers: { cookie: outsiderCookie }, payload: { name: 'Stolen' } });
    const ownerList = z.array(machineClientSchema).parse((await app.inject({ method: 'GET', url: '/api/v1/machine-clients', headers: { cookie: ownerCookie } })).json());

    expect(outsiderList.json()).toEqual([]);
    expect(revoke.statusCode).toBe(404);
    expect(issue.statusCode).toBe(404);
    expect(ownerList.find((candidate) => candidate.id === client.id)?.revokedAt).toBeNull();
  });
});
