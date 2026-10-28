export const integrationDirections = [
  { id: 'inbound', label: 'Inbound API', summary: 'Endpoints external systems call to send documents to xBO or read data from it.' },
  { id: 'outbound', label: 'Outbound events', summary: 'Webhooks xBO sends to subscribed systems when masters, balances or documents change.' },
  { id: 'feeds', label: 'Polling feeds', summary: 'Queues external systems poll for work, then acknowledge with a result.' },
  { id: 'gateways', label: 'Gateways', summary: 'Tax authority and payment services xBO calls directly.' },
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
  ['Token (username and password)', 'POST /api/v1/auth/token', 'Integration'],
  ['Create sales order', 'POST /api/v1/integration/orders', 'Sales'],
  ['Create quotation', 'POST /api/v1/integration/quotations', 'Sales'],
  ['Post completed sale', 'POST /api/v1/integration/sales', 'Billing'],
  ['Credit note request', 'POST /api/v1/integration/credit-note-requests', 'Billing'],
  ['Delivery and market returns', 'POST /api/v1/integration/returns', 'Returns'],
  ['Customer payment', 'POST /api/v1/integration/payments', 'Receivables'],
  ['New outlet from the field', 'POST /api/v1/integration/customers', 'Master data'],
  ['Stock requisition', 'POST /api/v1/integration/stock-requests', 'Inventory'],
  ['Stock take results', 'POST /api/v1/integration/stock-takes', 'Inventory'],
  ['Field expenses', 'POST /api/v1/integration/expenses', 'Finance'],
  ['Order status', 'GET /api/v1/integration/orders/{reference}', 'Sales'],
  ['Price lists and special prices', 'GET /api/v1/integration/prices', 'Pricing'],
  ['Promotions', 'GET /api/v1/integration/promotions', 'Trade'],
  ['Warehouse and van stock', 'GET /api/v1/integration/stock-balances', 'Inventory'],
  ['Credit limit and open invoices', 'GET /api/v1/integration/customers/{code}/credit', 'Credit'],
  ['Sales targets', 'GET /api/v1/integration/targets', 'Planning'],
];

const outbound: [string, string, string][] = [
  ['Customer created or changed', 'customer.updated', 'Master data'],
  ['Product created or changed', 'product.updated', 'Master data'],
  ['Price list published', 'price-list.published', 'Pricing'],
  ['Stock balance changed', 'stock.balance-changed', 'Inventory'],
  ['Promotion published', 'promotion.published', 'Trade'],
  ['Order status changed', 'order.status-changed', 'Sales'],
  ['Invoice issued', 'invoice.issued', 'Billing'],
  ['Payment allocated', 'payment.allocated', 'Receivables'],
  ['Delivery trip planned', 'trip.planned', 'Logistics'],
];

const feeds: [string, string, string][] = [
  ['Orders waiting for an external system', 'GET /api/v1/integration/feeds/orders', 'Sales'],
  ['Invoices waiting for an external system', 'GET /api/v1/integration/feeds/invoices', 'Billing'],
  ['Acknowledge a feed item', 'POST /api/v1/integration/feeds/{id}/ack', 'Integration'],
];

const gateways: [string, string, string][] = [
  ['KRA eTIMS e-invoicing', 'Signed invoices and QR data', 'Billing'],
  ['URA EFRIS e-invoicing and TIN checks', 'Signed invoices and TIN validation', 'Billing'],
  ['M-Pesa (Daraja)', 'STK push and C2B confirmations', 'Receivables'],
  ['MTN MoMo', 'Collections', 'Receivables'],
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
