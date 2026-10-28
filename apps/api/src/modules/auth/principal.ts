import type { MachineAuthScheme } from '@xbo/contracts';

export interface UserPrincipal {
  readonly kind: 'user';
  readonly userId: string;
  readonly sessionId: string;
  readonly organizationId: string | null;
}

export interface MachinePrincipal {
  readonly kind: 'machine';
  readonly scheme: MachineAuthScheme;
  readonly organizationId: string;
  readonly machineClientId: string;
}

export type Principal = UserPrincipal | MachinePrincipal;

export type PrincipalKind = Principal['kind'];

declare module 'fastify' {
  interface FastifyRequest {
    principal?: Principal;
  }
}
