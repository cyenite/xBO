export const integrationDirections = [
  { id: 'inbound', label: 'Inbound API', summary: 'Endpoints external systems call to send documents to xBO or read data from it.' },
  { id: 'outbound', label: 'Outbound events', summary: 'Webhooks xBO sends to subscribed systems when leases, balances or documents change.' },
  { id: 'feeds', label: 'Polling feeds', summary: 'Queues external systems poll for work, then acknowledge with a result.' },
  { id: 'gateways', label: 'Gateways', summary: 'Payment, messaging and tax services xBO calls directly.' },
] as const;

export type IntegrationDirectionId = (typeof integrationDirections)[number]['id'];

export interface IntegrationPoint {
  name: string;
  target: string;
  module: string;
  direction: IntegrationDirectionId;
}

const inbound: [string, string, string][] = [
  ['Token (OAuth 2 client credentials)', 'POST /api/v1/auth/oauth/token', 'Integration'],
  ['Payment received', 'POST /api/v1/integration/payments', 'Collections'],
  ['Maintenance request from a tenant', 'POST /api/v1/integration/maintenance-requests', 'Maintenance'],
  ['Meter readings', 'POST /api/v1/integration/meter-readings', 'Billing'],
  ['Rental application', 'POST /api/v1/integration/applications', 'Leasing'],
  ['Tenant balance and statement', 'GET /api/v1/integration/tenants/{reference}/statement', 'Collections'],
  ['Open invoices', 'GET /api/v1/integration/tenants/{reference}/invoices', 'Billing'],
  ['Vacant units', 'GET /api/v1/integration/units?status=vacant', 'Portfolio'],
  ['Payment status', 'GET /api/v1/integration/payments/{reference}', 'Collections'],
];

const outbound: [string, string, string][] = [
  ['Invoice issued', 'invoice.issued', 'Billing'],
  ['Payment matched', 'payment.matched', 'Collections'],
  ['Payment could not be matched', 'payment.unmatched', 'Collections'],
  ['Lease signed', 'lease.signed', 'Leasing'],
  ['Notice given', 'lease.notice-given', 'Leasing'],
  ['Unit became vacant', 'unit.vacated', 'Portfolio'],
  ['Work order status changed', 'work-order.status-changed', 'Maintenance'],
  ['Owner statement approved', 'owner-statement.approved', 'Owners'],
];

const feeds: [string, string, string][] = [
  ['Reminders waiting to be sent', 'GET /api/v1/integration/feeds/reminders', 'Collections'],
  ['Owner remittances waiting for payment', 'GET /api/v1/integration/feeds/remittances', 'Owners'],
  ['Acknowledge a feed item', 'POST /api/v1/integration/feeds/{id}/ack', 'Integration'],
];

const gateways: [string, string, string][] = [
  ['M-Pesa (Daraja)', 'Paybill C2B confirmations and STK push', 'Collections'],
  ['Bank statement import', 'CSV, MT940 and bank APIs', 'Collections'],
  ['SMS and email', 'Invoices, receipts and reminders', 'Collections'],
  ['KRA eTIMS e-invoicing', 'Signed invoices for VAT-registered landlords', 'Billing'],
];

function toPoints(rows: [string, string, string][], direction: IntegrationDirectionId): IntegrationPoint[] {
  return rows.map(([name, target, module]) => ({ name, target, module, direction }));
}

export const integrationPoints: IntegrationPoint[] = [
  ...toPoints(inbound, 'inbound'),
  ...toPoints(outbound, 'outbound'),
  ...toPoints(feeds, 'feeds'),
  ...toPoints(gateways, 'gateways'),
];
