import type { StatusTone } from '../components/status';

// Illustrative records so the shell can be evaluated before the API modules exist (plan Phase 3).
export const unitStatuses = [
  { value: 'vacant', label: 'Vacant', tone: 'neutral' },
  { value: 'current', label: 'Current', tone: 'success' },
  { value: 'arrears', label: 'In arrears', tone: 'danger' },
  { value: 'renewal-due', label: 'Renewal due', tone: 'warning' },
  { value: 'notice-given', label: 'Notice given', tone: 'info' },
] as const satisfies readonly { value: string; label: string; tone: StatusTone }[];

export type UnitStatus = (typeof unitStatuses)[number]['value'];

export interface LedgerEntry {
  date: string;
  amount: number;
  description: string;
}

export interface RentRollUnit {
  unit: string;
  property: string;
  unitType: string;
  rent: number;
  balance: number;
  status: UnitStatus;
  tenant: string | null;
  leaseEnd: string | null;
  leaseStart: string | null;
  ledger: LedgerEntry[];
}

const properties = [
  { name: 'Kilimani Heights', prefix: 'KH' },
  { name: 'Riverside Court', prefix: 'RC' },
  { name: 'Ngong Road Plaza', prefix: 'NP' },
  { name: 'Lavington Gardens', prefix: 'LG' },
];

const unitTypes = [
  { unitType: 'Studio', rent: 28_000, serviceCharge: 3_000 },
  { unitType: '1 bedroom', rent: 42_000, serviceCharge: 4_000 },
  { unitType: '2 bedroom', rent: 65_000, serviceCharge: 5_500 },
  { unitType: '3 bedroom', rent: 95_000, serviceCharge: 7_500 },
  { unitType: 'Shop', rent: 80_000, serviceCharge: 9_000 },
];

const tenants = [
  'A. Wanjiku',
  'B. Otieno',
  'C. Mutua',
  'D. Achieng',
  'E. Kiprono',
  'F. Njoroge',
  'G. Auma',
  'H. Kamau',
  'Upendo Pharmacy Ltd',
  'I. Chebet',
  'J. Mwangi',
  'Baraka Cafe Ltd',
  'K. Wafula',
  'L. Nyambura',
];

const paymentMethods = ['M-Pesa', 'M-Pesa', 'M-Pesa', 'Bank transfer', 'Cheque'];
const statusCycle: UnitStatus[] = ['current', 'current', 'arrears', 'current', 'renewal-due', 'vacant', 'current', 'notice-given', 'current', 'arrears'];

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

function monthStart(monthsAgo: number): string {
  return `2026-${String(10 - monthsAgo).padStart(2, '0')}-01`;
}

function buildLedger(rent: number, serviceCharge: number, status: UnitStatus, random: () => number): LedgerEntry[] {
  const ledger: LedgerEntry[] = [];
  const method = pick(paymentMethods, random);
  const isInArrears = status === 'arrears';

  for (let monthsAgo = 2; monthsAgo >= 0; monthsAgo -= 1) {
    const date = monthStart(monthsAgo);
    const paidOn = `${date.slice(0, 8)}0${3 + Math.floor(random() * 5)}`;
    const isUnpaid = isInArrears && monthsAgo < 2;

    ledger.push({ date, amount: rent, description: 'Rent' });
    ledger.push({ date, amount: serviceCharge, description: 'Service charge' });

    if (!isUnpaid) ledger.push({ date: paidOn, amount: -(rent + serviceCharge), description: `Payment, ${method}` });
  }

  return ledger;
}

export function buildSampleUnits(count = 46): RentRollUnit[] {
  const random = seeded(2026);

  return Array.from({ length: count }, (_, index) => {
    const property = properties[index % properties.length] as (typeof properties)[number];
    const type = pick(unitTypes, random);
    const status = statusCycle[index % statusCycle.length] as UnitStatus;
    const floor = 1 + Math.floor(index / properties.length / 3);
    const door = 1 + (Math.floor(index / properties.length) % 3);
    const startYear = 2024 + Math.floor(random() * 2);
    const startMonth = 1 + Math.floor(random() * 12);
    const endYear = status === 'renewal-due' || status === 'notice-given' ? 2026 : startYear + 3;
    const endMonth = status === 'renewal-due' || status === 'notice-given' ? 12 : startMonth;
    const isVacant = status === 'vacant';
    const ledger = isVacant ? [] : buildLedger(type.rent, type.serviceCharge, status, random);

    return {
      unit: `${property.prefix}-${floor}${String(door).padStart(2, '0')}`,
      property: property.name,
      unitType: type.unitType,
      rent: type.rent,
      balance: ledger.reduce((sum, entry) => sum + entry.amount, 0),
      status,
      tenant: isVacant ? null : pick(tenants, random),
      leaseEnd: isVacant ? null : `${endYear}-${String(endMonth).padStart(2, '0')}-01`,
      leaseStart: isVacant ? null : `${startYear}-${String(startMonth).padStart(2, '0')}-01`,
      ledger,
    };
  });
}

export function statusMeta(status: UnitStatus) {
  return unitStatuses.find((candidate) => candidate.value === status) ?? unitStatuses[0];
}

export const kes = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2 });
