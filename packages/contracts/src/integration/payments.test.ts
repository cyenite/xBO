import { describe, expect, it } from 'vitest';
import { inboundPaymentResponseSchema, inboundPaymentSchema } from './payments';

const payment = {
  amount: '45000.00',
  paidAt: '2026-10-03T09:14:00+03:00',
  method: 'mobile-money',
  currency: 'kes',
  payerName: 'A. Wanjiku',
  externalId: 'TJ3K8Q2M1P',
  payerPhone: '+254700000000',
  accountReference: 'KH-101',
};

describe('inbound payment contract', () => {
  it('accepts a payment notification and normalises the currency', () => {
    expect(inboundPaymentSchema.parse(payment).currency).toBe('KES');
  });

  it('keeps amounts as exact, positive decimal strings', () => {
    expect(inboundPaymentSchema.safeParse({ ...payment, amount: 45000 }).success).toBe(false);
    expect(inboundPaymentSchema.safeParse({ ...payment, amount: '-10.00' }).success).toBe(false);
  });

  it('requires an account reference to match against', () => {
    expect(inboundPaymentSchema.safeParse({ ...payment, accountReference: ' ' }).success).toBe(false);
  });

  it('describes the response for an unmatched payment', () => {
    const response = { paymentId: '7d0c1f8e-3b4a-4c2d-9e1f-0a1b2c3d4e5f', externalId: 'TJ3K8Q2M1P', matchStatus: 'unmatched', receiptNumber: null };

    expect(inboundPaymentResponseSchema.parse(response)).toEqual(response);
  });
});
