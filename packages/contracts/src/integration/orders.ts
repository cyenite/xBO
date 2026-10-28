import { z } from 'zod';

// Field apps send amounts and quantities either as JSON numbers or as decimal strings, so both are accepted.
const numeric = z.union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)]);

export const inboundOrderLineSchema = z.object({
  line_id: z.union([z.number(), z.string()]),
  uom_code: z.string().nullable(),
  tax_code: z.string().nullable(),
  item_code: z.string(),
  item_text: z.string().nullable(),
  item_type: z.enum(['NORMAL', 'BONUS']).optional(),
  base_price: numeric,
  item_price: numeric,
  discount_rate: numeric.nullable(),
  item_quantity: numeric,
  blanket_agreement_id: z.union([z.number(), z.string()]).nullable(),
});

export const inboundOrderFileSchema = z.object({
  name: z.string().optional(),
  content: z.string(),
});

// A sales order posted by a field sales app or another external system.
export const inboundOrderSchema = z.object({
  id: z.union([z.number(), z.string()]),
  route: z.string().nullable(),
  notes: z.string().nullable(),
  files: z.array(inboundOrderFileSchema).default([]),
  region: z.string().nullable(),
  latitude: numeric.nullable().optional(),
  longitude: numeric.nullable().optional(),
  user_code: z.string().nullable(),
  user_name: z.string().nullable().optional(),
  item_list: z.array(inboundOrderLineSchema).min(1),
  record_id: z.union([z.number(), z.string()]),
  store_code: z.string().nullable(),
  lpo_number: z.string().nullable(),
  client_code: z.string().nullable(),
  ship_to_code: z.string().nullable(),
  vehicle_code: z.string().nullable(),
  customer_code: z.string(),
  customer_name: z.string().nullable(),
  payment_method: z.string().nullable().optional(),
  transaction_id: z.union([z.number(), z.string()]),
  warehouse_code: z.string().nullable(),
  organization_id: z.union([z.number(), z.string()]).nullable(),
  transaction_type: z.string(),
  transaction_date: z.string().nullable(),
  payment_reference: z.string().nullable().optional(),
  organization_code: z.string().nullable(),
  customer_discount_rate: numeric.nullable(),
  customer_phone_number: z.string().nullable(),
  expected_delivery_date: z.string().nullable(),
});

// Callers read transaction_reference as the xBO document number; an empty or missing reference means the post failed.
export const inboundPostResponseSchema = z.object({
  transaction_id: z.union([z.number(), z.string()]),
  transaction_reference: z.string(),
});

export type InboundOrder = z.infer<typeof inboundOrderSchema>;
export type InboundOrderLine = z.infer<typeof inboundOrderLineSchema>;
export type InboundPostResponse = z.infer<typeof inboundPostResponseSchema>;
