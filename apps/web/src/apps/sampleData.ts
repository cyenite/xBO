import type { StatusTone } from '../components/status';

// Illustrative records so the shell can be evaluated before the API modules exist (plan Phase 4).
export const orderStatuses = [
  { value: 'draft', label: 'Draft', tone: 'neutral' },
  { value: 'credit-block', label: 'Credit block', tone: 'danger' },
  { value: 'confirmed', label: 'Confirmed', tone: 'info' },
  { value: 'short-stock', label: 'Short stock', tone: 'warning' },
  { value: 'delivered', label: 'Delivered', tone: 'info' },
  { value: 'invoiced', label: 'Invoiced', tone: 'success' },
] as const satisfies readonly { value: string; label: string; tone: StatusTone }[];

export type OrderStatus = (typeof orderStatuses)[number]['value'];

export interface OrderLine {
  sku: string;
  product: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface SalesOrder {
  number: string;
  date: string;
  route: string;
  status: OrderStatus;
  source: 'Field app' | 'Back office';
  amount: number;
  salesRep: string;
  customer: string;
  lineCount: number;
  lines: OrderLine[];
}

const customers = [
  'Mama Njeri Shop',
  'Kilimani Mini Mart',
  'Baraka Wholesalers',
  'Upendo General Store',
  'Riverside Supermarket',
  'Tumaini Distributors',
  'Jamhuri Kiosk',
  'Greenfield Hotel',
  'Neema Retailers',
  'Lakeview Cash and Carry',
  'Sunrise Duka',
  'Mwangaza Traders',
];

const products = [
  { sku: 'SOD-500-24', product: 'Soda 500 ml', unit: 'Case of 24', unitPrice: 1150 },
  { sku: 'WAT-1L-12', product: 'Mineral water 1 L', unit: 'Case of 12', unitPrice: 540 },
  { sku: 'MAZ-2KG-12', product: 'Maize flour 2 kg', unit: 'Bale of 12', unitPrice: 1980 },
  { sku: 'OIL-1L-12', product: 'Cooking oil 1 L', unit: 'Case of 12', unitPrice: 3360 },
  { sku: 'TEA-250-40', product: 'Tea leaves 250 g', unit: 'Carton of 40', unitPrice: 5200 },
  { sku: 'SOA-175-24', product: 'Bar soap 175 g', unit: 'Carton of 24', unitPrice: 1440 },
  { sku: 'JUI-1L-12', product: 'Mango juice 1 L', unit: 'Case of 12', unitPrice: 1620 },
];

const routes = ['NRB-East 01', 'NRB-East 02', 'NRB-West 04', 'Thika 02', 'Kiambu 03', 'Machakos 01'];
const reps = ['A. Wanjiku', 'B. Otieno', 'C. Mutua', 'D. Achieng', 'E. Kiprono'];
const statusCycle: OrderStatus[] = ['confirmed', 'invoiced', 'delivered', 'credit-block', 'confirmed', 'invoiced', 'short-stock', 'draft', 'invoiced', 'delivered'];

function seeded(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;

    return state / 2147483648;
  };
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)] as T;
}

export function buildSampleOrders(count = 46): SalesOrder[] {
  const random = seeded(2026);
  const start = new Date('2026-10-27T08:00:00');

  return Array.from({ length: count }, (_, index) => {
    const lineCount = 1 + Math.floor(random() * 5);
    const lines: OrderLine[] = Array.from({ length: lineCount }, () => {
      const product = pick(products, random);
      const quantity = 2 + Math.floor(random() * 38);

      return { ...product, quantity, amount: quantity * product.unitPrice };
    });
    const date = new Date(start.getTime() - Math.floor(index / 6) * 86_400_000);

    return {
      number: `SO-${String(28_431 - index).padStart(6, '0')}`,
      date: date.toISOString().slice(0, 10),
      route: pick(routes, random),
      status: statusCycle[index % statusCycle.length] as OrderStatus,
      source: random() > 0.25 ? 'Field app' : 'Back office',
      amount: lines.reduce((sum, line) => sum + line.amount, 0),
      salesRep: pick(reps, random),
      customer: pick(customers, random),
      lineCount,
      lines,
    };
  });
}

export function statusMeta(status: OrderStatus) {
  return orderStatuses.find((candidate) => candidate.value === status) ?? orderStatuses[0];
}

export const kes = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2 });
export const quantityFormat = new Intl.NumberFormat('en-KE');
