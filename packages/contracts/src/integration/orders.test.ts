import { describe, expect, it } from 'vitest';
import { inboundOrderSchema, inboundPostResponseSchema } from './orders';

const order = {
  id: 1201,
  route: 'NRB-EAST-01',
  notes: null,
  files: [],
  region: 'Nairobi',
  user_code: 'REP014',
  item_list: [
    {
      line_id: 1,
      uom_code: 'CTN',
      tax_code: 'VAT16',
      item_code: 'SODA-500-24',
      item_text: 'Soda 500ml x24',
      base_price: '1200.00',
      item_price: '1150.00',
      discount_rate: '4.17',
      item_quantity: '10',
      blanket_agreement_id: null,
    },
  ],
  record_id: 1201,
  store_code: null,
  lpo_number: 'LPO-88',
  client_code: 'DEMO',
  ship_to_code: null,
  vehicle_code: 'KDA123A',
  customer_code: 'C00042',
  customer_name: 'Mama Njeri Shop',
  transaction_id: 1201,
  warehouse_code: 'WH01',
  organization_id: 1,
  transaction_type: 'Order',
  transaction_date: '2026-10-27',
  organization_code: null,
  customer_discount_rate: '0',
  customer_phone_number: '0700000000',
  expected_delivery_date: null,
};

describe('inbound order contract', () => {
  it('accepts an order posted by a field sales app', () => {
    expect(inboundOrderSchema.safeParse(order).success).toBe(true);
  });

  it('accepts numeric fields sent as numbers', () => {
    const line = { ...order.item_list[0], base_price: 1200, item_price: 1150, item_quantity: 10 };

    expect(inboundOrderSchema.safeParse({ ...order, item_list: [line] }).success).toBe(true);
  });

  it('rejects an order without lines', () => {
    expect(inboundOrderSchema.safeParse({ ...order, item_list: [] }).success).toBe(false);
  });

  it('describes the post response callers read', () => {
    expect(inboundPostResponseSchema.parse({ transaction_id: 1201, transaction_reference: 'SO-000123' }))
      .toEqual({ transaction_id: 1201, transaction_reference: 'SO-000123' });
  });
});
