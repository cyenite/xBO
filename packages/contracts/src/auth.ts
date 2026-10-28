import { z } from 'zod';
import { organizationSummarySchema } from './organizations';

export const machineAuthSchemes = [
  { value: 'basic', label: 'HTTP basic' },
  { value: 'bearer', label: 'Bearer token' },
  { value: 'token-header', label: 'TOKEN header' },
  { value: 'api-key-header', label: 'X-Api-Key header' },
] as const;

export type MachineAuthScheme = (typeof machineAuthSchemes)[number]['value'];

export const machineAuthSchemeSchema = z.enum(machineAuthSchemes.map((scheme) => scheme.value) as [MachineAuthScheme, ...MachineAuthScheme[]]);

export const loginRequestSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

export const sessionUserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
});

export const sessionResponseSchema = z.object({
  user: sessionUserSchema,
  organization: organizationSummarySchema.nullable(),
  organizations: z.array(organizationSummarySchema),
});

export const switchOrganizationRequestSchema = z.object({
  organizationId: z.uuid(),
});

export const principalResponseSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('user'),
    userId: z.uuid(),
    organizationId: z.uuid().nullable(),
  }),
  z.object({
    kind: z.literal('machine'),
    scheme: machineAuthSchemeSchema,
    organizationId: z.uuid(),
    machineClientId: z.uuid(),
  }),
]);

// Field names follow RFC 6749 and the bodies integration clients send, so they stay snake_case.
export const clientCredentialsTokenRequestSchema = z.object({
  client_id: z.string().min(1).optional(),
  grant_type: z.literal('client_credentials'),
  client_secret: z.string().min(1).optional(),
});

export const accessTokenResponseSchema = z.object({
  token_type: z.literal('Bearer'),
  expires_in: z.number().int().positive(),
  access_token: z.string(),
});

export const passwordTokenRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const passwordTokenResponseSchema = z.object({
  token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number().int().positive(),
});

export const machineClientSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  clientId: z.string(),
  createdAt: z.iso.datetime(),
  revokedAt: z.iso.datetime().nullable(),
  lastUsedAt: z.iso.datetime().nullable(),
});

export const machineClientTokenSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  createdAt: z.iso.datetime(),
  revokedAt: z.iso.datetime().nullable(),
  lastUsedAt: z.iso.datetime().nullable(),
});

export const createMachineClientRequestSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const createMachineClientTokenRequestSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const createdMachineClientResponseSchema = z.object({
  client: machineClientSchema,
  clientSecret: z.string(),
});

export const createdMachineClientTokenResponseSchema = z.object({
  token: machineClientTokenSchema,
  tokenSecret: z.string(),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
export type MachineClient = z.infer<typeof machineClientSchema>;
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
export type PrincipalResponse = z.infer<typeof principalResponseSchema>;
export type MachineClientToken = z.infer<typeof machineClientTokenSchema>;
export type AccessTokenResponse = z.infer<typeof accessTokenResponseSchema>;
export type PasswordTokenRequest = z.infer<typeof passwordTokenRequestSchema>;
export type PasswordTokenResponse = z.infer<typeof passwordTokenResponseSchema>;
export type SwitchOrganizationRequest = z.infer<typeof switchOrganizationRequestSchema>;
export type CreateMachineClientRequest = z.infer<typeof createMachineClientRequestSchema>;
export type CreatedMachineClientResponse = z.infer<typeof createdMachineClientResponseSchema>;
export type ClientCredentialsTokenRequest = z.infer<typeof clientCredentialsTokenRequestSchema>;
export type CreateMachineClientTokenRequest = z.infer<typeof createMachineClientTokenRequestSchema>;
export type CreatedMachineClientTokenResponse = z.infer<typeof createdMachineClientTokenResponseSchema>;
