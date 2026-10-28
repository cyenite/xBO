import { z } from 'zod';

export const organizationSummarySchema = z.object({
  id: z.uuid(),
  code: z.string(),
  name: z.string(),
});

// External systems identify the organisation by this code (`organization_code` in their payloads), so it must stay stable.
export const createOrganizationRequestSchema = z.object({
  code: z.string().trim().min(1).max(32).regex(/^[A-Za-z0-9_-]+$/, 'Use letters, digits, hyphens and underscores only'),
  name: z.string().trim().min(1).max(200),
});

export type OrganizationSummary = z.infer<typeof organizationSummarySchema>;
export type CreateOrganizationRequest = z.infer<typeof createOrganizationRequestSchema>;
