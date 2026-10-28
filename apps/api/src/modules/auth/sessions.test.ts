import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { sessionResponseSchema } from '@xbo/contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createOrganization, createTestApp, createUser, login } from '../../testing/test-app';

describe('session authentication', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('signs in, sets an http-only cookie and selects the only organisation', async () => {
    const user = await createUser(app);
    const organization = await createOrganization(app, user);
    const response = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: user.email.toUpperCase(), password: user.password } });
    const cookie = response.cookies.find((candidate) => candidate.name === 'xbo_session');
    const session = sessionResponseSchema.parse(response.json());

    expect(response.statusCode).toBe(200);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('Lax');
    expect(session.user.email).toBe(user.email);
    expect(session.organization?.id).toBe(organization.id);
  });

  it('rejects a wrong password, an unknown email and an inactive user alike', async () => {
    const user = await createUser(app);
    const inactive = await createUser(app, false);
    const attempts = [
      { email: user.email, password: 'wrong' },
      { email: 'nobody@example.test', password: 'wrong' },
      { email: inactive.email, password: inactive.password },
    ];

    for (const payload of attempts) {
      const response = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload });

      expect(response.statusCode).toBe(401);
      expect(response.cookies).toHaveLength(0);
    }
  });

  it('validates the login body', async () => {
    const response = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: 'not-an-email' } });

    expect(response.statusCode).toBe(400);
  });

  it('requires a session for protected routes', async () => {
    expect((await app.inject({ method: 'GET', url: '/api/v1/auth/session' })).statusCode).toBe(401);
    expect((await app.inject({ method: 'GET', url: '/api/v1/auth/session', headers: { cookie: 'xbo_session=forged' } })).statusCode).toBe(401);
  });

  it('leaves the organisation unselected for members of several, and switches only to their own', async () => {
    const user = await createUser(app);
    const stranger = await createUser(app);
    const first = await createOrganization(app, user);
    const second = await createOrganization(app, user);
    const foreign = await createOrganization(app, stranger);
    const cookie = await login(app, user);
    const session = sessionResponseSchema.parse((await app.inject({ method: 'GET', url: '/api/v1/auth/session', headers: { cookie } })).json());
    const switched = await app.inject({ method: 'PUT', url: '/api/v1/auth/session/organization', headers: { cookie }, payload: { organizationId: second.id } });
    const refused = await app.inject({ method: 'PUT', url: '/api/v1/auth/session/organization', headers: { cookie }, payload: { organizationId: foreign.id } });

    expect(session.organization).toBeNull();
    expect(session.organizations.map((organization) => organization.id).sort()).toEqual([first.id, second.id].sort());
    expect(sessionResponseSchema.parse(switched.json()).organization?.id).toBe(second.id);
    expect(refused.statusCode).toBe(403);
  });

  it('signs out by deleting the session', async () => {
    const user = await createUser(app);
    const cookie = await login(app, user);
    const logout = await app.inject({ method: 'POST', url: '/api/v1/auth/logout', headers: { cookie } });

    expect(logout.statusCode).toBe(204);
    expect((await app.inject({ method: 'GET', url: '/api/v1/auth/session', headers: { cookie } })).statusCode).toBe(401);
  });

  it('lets a user create an organisation they then belong to, with unique codes', async () => {
    const user = await createUser(app);
    const cookie = await login(app, user);
    const code = `NEW-${Date.now()}`;
    const created = await app.inject({ method: 'POST', url: '/api/v1/organizations', headers: { cookie }, payload: { code, name: 'New Co' } });
    const duplicate = await app.inject({ method: 'POST', url: '/api/v1/organizations', headers: { cookie }, payload: { code, name: 'Again' } });
    const listed = await app.inject({ method: 'GET', url: '/api/v1/organizations', headers: { cookie } });

    expect(created.statusCode).toBe(201);
    expect(duplicate.statusCode).toBe(409);
    expect(listed.json()).toEqual([expect.objectContaining({ code, name: 'New Co' })]);
  });
});
