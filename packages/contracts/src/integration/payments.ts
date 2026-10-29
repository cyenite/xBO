import { z } from 'zod';

export const paymentMethods = [
  { value: 'mobile-money', label: 'Mobile money' },
  { value: 'bank-transfer', label: 'Bank transfer' },
  { value: 'card', label: 'Card' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'cash', label: 'Cash' },
] as const;

export type PaymentMethod = (typeof paymentMethods)[number]['value'];

export const paymentMethodSchema = z.enum(paymentMethods.map((method) => method.value) as [PaymentMethod, ...PaymentMethod[]]);

export const paymentMatchStatuses = [
  { value: 'matched', label: 'Matched' },
  { value: 'unmatched', label: 'Unmatched' },
] as const;

export type PaymentMatchStatus = (typeof paymentMatchStatuses)[number]['value'];

export const paymentMatchStatusSchema = z.enum(paymentMatchStatuses.map((status) => status.value) as [PaymentMatchStatus, ...PaymentMatchStatus[]]);

// A payment reported by a payment gateway, a bank feed or a tenant portal. `accountReference` is what the payer
// typed (a unit or tenant reference) and drives matching; `externalId` makes a resent notification a no-op.
export const inboundPaymentSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,4})?$/),
  paidAt: z.iso.datetime({ offset: true }),
  method: paymentMethodSchema,
  currency: z.string().length(3).toUpperCase(),
  payerName: z.string().trim().min(1).nullable(),
  externalId: z.string().trim().min(1).max(120),
  payerPhone: z.string().trim().min(1).nullable(),
  accountReference: z.string().trim().min(1).max(60),
});

export const inboundPaymentResponseSchema = z.object({
  paymentId: z.uuid(),
  externalId: z.string(),
  matchStatus: paymentMatchStatusSchema,
  receiptNumber: z.string().nullable(),
});

export type InboundPayment = z.infer<typeof inboundPaymentSchema>;
export type InboundPaymentResponse = z.infer<typeof inboundPaymentResponseSchema>;
