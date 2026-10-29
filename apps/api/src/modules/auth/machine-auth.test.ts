import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  accessTokenResponseSchema,
  createdMachineClientResponseSchema,
  createdMachineClientTokenResponseSchema,
  principalResponseSchema,
  type CreatedMachineClientResponse,
} from '@xbo/contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createOrganization, createTestApp, createUser, login, type TestOrganization } from '../../testing/test-app';

describe('machine client authentication', () => {
  let app: NestFastifyApplication;
  let cookie: string;
  let organization: TestOrganization;
  let created: CreatedMachineClientResponse;

  const whoAmI = (headers: Record<string, string>) => app.inject({ method: 'GET', url: '/api/v1/auth/principal', headers });

  beforeAll(async () => {
    app = await createTestApp();

    const user = await createUser(app);

    organization = await createOrganization(app, user);
    cookie = await login(app, user);

    const response = await app.inject({ method: 'POST', url: '/api/v1/machine-clients', headers: { cookie }, payload: { name: 'Payment gateway' } });

    created = createdMachineClientResponseSchema.parse(response.json());
  });

  afterAll(async () => {
    await app.close();
  });

  it('accepts HTTP basic auth with the client id and secret', async () => {
    const authorization = `Basic ${Buffer.from(`${created.client.clientId}:${created.clientSecret}`).toString('base64')}`;
    const principal = principalResponseSchema.parse((await whoAmI({ authorization })).json());

    expect(principal).toEqual({ kind: 'machine', scheme: 'basic', organizationId: organization.id, machineClientId: created.client.id });
  });

  it('issues client-credentials tokens from a JSON body', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/oauth/token',
      payload: { grant_type: 'client_credentials', client_id: created.client.clientId, client_secret: created.clientSecret },
    });
    const token = accessTokenResponseSchema.parse(response.json());

    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect((await whoAmI({ authorization: `Bearer ${token.access_token}` })).json()).toMatchObject({ kind: 'machine', scheme: 'bearer' });
  });

  it('issues client-credentials tokens from a form body, ignoring scope', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/oauth/token',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      payload: `grant_type=client_credentials&client_id=${created.client.clientId}&client_secret=${created.clientSecret}&scope=integration`,
    });

    expect(response.statusCode).toBe(200);
    expect(accessTokenResponseSchema.parse(response.json()).access_token).toMatch(/^xbo_at_/);
  });

  it('accepts client credentials in a basic header on the token endpoint', async () => {
    const authorization = `Basic ${Buffer.from(`${created.client.clientId}:${created.clientSecret}`).toString('base64')}`;
    const response = await app.inject({ method: 'POST', url: '/api/v1/auth/oauth/token', headers: { authorization }, payload: { grant_type: 'client_credentials' } });

    expect(response.statusCode).toBe(200);
  });

  it('answers token errors in the OAuth 2 shape', async () => {
    const wrongSecret = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/oauth/token',
      payload: { grant_type: 'client_credentials', client_id: created.client.clientId, client_secret: 'wrong' },
    });
    const wrongGrant = await app.inject({ method: 'POST', url: '/api/v1/auth/oauth/token', payload: { grant_type: 'password' } });
    const missingGrant = await app.inject({ method: 'POST', url: '/api/v1/auth/oauth/token', payload: {} });

    expect([wrongSecret.statusCode, wrongSecret.json()]).toEqual([401, { error: 'invalid_client' }]);
    expect([wrongGrant.statusCode, wrongGrant.json()]).toEqual([400, { error: 'unsupported_grant_type' }]);
    expect([missingGrant.statusCode, missingGrant.json()]).toEqual([400, { error: 'invalid_request' }]);
  });

  it('accepts a static token as a bearer token and an X-Api-Key header', async () => {
    const response = await app.inject({ method: 'POST', url: `/api/v1/machine-clients/${created.client.id}/tokens`, headers: { cookie }, payload: { name: 'Static' } });
    const { tokenSecret } = createdMachineClientTokenResponseSchema.parse(response.json());
    const cases = [
      { headers: { authorization: `Bearer ${tokenSecret}` }, scheme: 'bearer' },
      { headers: { 'x-api-key': tokenSecret }, scheme: 'api-key-header' },
    ];

    for (const { headers, scheme } of cases) {
      expect(principalResponseSchema.parse((await whoAmI(headers)).json())).toMatchObject({ kind: 'machine', scheme, organizationId: organization.id });
    }
  });

  it('rejects bad credentials instead of falling back to the session cookie', async () => {
    expect((await whoAmI({ authorization: 'Bearer xbo_st_nope', cookie })).statusCode).toBe(401);
    expect((await whoAmI({ 'x-api-key': 'nope' })).statusCode).toBe(401);
  });

  it('keeps machine clients off user-only routes', async () => {
    const authorization = `Basic ${Buffer.from(`${created.client.clientId}:${created.clientSecret}`).toString('base64')}`;

    expect((await app.inject({ method: 'GET', url: '/api/v1/machine-clients', headers: { authorization } })).statusCode).toBe(403);
  });

  it('stops every credential of a revoked client, including tokens issued before revocation', async () => {
    const response = await app.inject({ method: 'POST', url: '/api/v1/machine-clients', headers: { cookie }, payload: { name: 'To revoke' } });
    const client = createdMachineClientResponseSchema.parse(response.json());
    const tokenResponse = await app.inject({ method: 'POST', url: `/api/v1/machine-clients/${client.client.id}/tokens`, headers: { cookie }, payload: { name: 'Static' } });
    const { tokenSecret } = createdMachineClientTokenResponseSchema.parse(tokenResponse.json());
    const issued = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/oauth/token',
      payload: { grant_type: 'client_credentials', client_id: client.client.clientId, client_secret: client.clientSecret },
    });
    const accessToken = accessTokenResponseSchema.parse(issued.json()).access_token;
    const authorization = `Basic ${Buffer.from(`${client.client.clientId}:${client.clientSecret}`).toString('base64')}`;

    expect((await app.inject({ method: 'DELETE', url: `/api/v1/machine-clients/${client.client.id}`, headers: { cookie } })).statusCode).toBe(204);

    for (const headers of [{ authorization }, { authorization: `Bearer ${accessToken}` }, { 'x-api-key': tokenSecret }]) {
      expect((await whoAmI(headers)).statusCode).toBe(401);
    }
  });

  it('stops a revoked static token without affecting the client', async () => {
    const response = await app.inject({ method: 'POST', url: `/api/v1/machine-clients/${created.client.id}/tokens`, headers: { cookie }, payload: { name: 'Short lived' } });
    const { token, tokenSecret } = createdMachineClientTokenResponseSchema.parse(response.json());
    const revoked = await app.inject({ method: 'DELETE', url: `/api/v1/machine-clients/${created.client.id}/tokens/${token.id}`, headers: { cookie } });
    const authorization = `Basic ${Buffer.from(`${created.client.clientId}:${created.clientSecret}`).toString('base64')}`;

    expect(revoked.statusCode).toBe(204);
    expect((await whoAmI({ 'x-api-key': tokenSecret })).statusCode).toBe(401);
    expect((await whoAmI({ authorization })).statusCode).toBe(200);
  });
});
