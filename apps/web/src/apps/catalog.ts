import { defineAsyncComponent, markRaw, type Component } from 'vue';
import {
  RiBox3Line,
  RiFileList3Line,
  RiInformationLine,
  RiLayoutMasonryLine,
  RiPlugLine,
  RiPriceTag3Line,
  RiRecycleLine,
  RiSettings3Line,
  RiShieldCheckLine,
  RiShoppingCart2Line,
  RiStore2Line,
  RiTruckLine,
  RiWallet3Line,
} from '../icons';

export const moduleGroups = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'sales', label: 'Sales' },
  { id: 'finance', label: 'Finance' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'logistics', label: 'Van sales and logistics' },
  { id: 'master-data', label: 'Master data' },
  { id: 'integration', label: 'Integration' },
  { id: 'system', label: 'System' },
] as const;

export type ModuleGroupId = (typeof moduleGroups)[number]['id'];

export interface WindowSize {
  width: number;
  height: number;
}

export interface PlannedWorkflow {
  title: string;
  steps: string[];
}

export interface AppDefinition {
  id: string;
  icon: Component;
  label: string;
  phase: string | null;
  group: ModuleGroupId;
  summary: string;
  keywords: string[];
  isPinned: boolean;
  component: Component;
  defaultSize: WindowSize;
  isSingleInstance: boolean;
  plannedWorkflows: PlannedWorkflow[];
}

const plannedModuleView = defineAsyncComponent(() => import('./PlannedModuleApp.vue'));

function defineApp(app: Omit<AppDefinition, 'icon' | 'component'> & { icon: Component; component?: Component }): AppDefinition {
  return {
    ...app,
    icon: markRaw(app.icon),
    component: markRaw(app.component ?? plannedModuleView),
  };
}

export const apps: AppDefinition[] = [
  defineApp({
    id: 'overview',
    icon: RiLayoutMasonryLine,
    label: 'Overview',
    phase: null,
    group: 'workspace',
    summary: 'What needs your attention today across sales, credit, stock and integration.',
    keywords: ['home', 'today', 'attention', 'queue'],
    isPinned: true,
    component: defineAsyncComponent(() => import('./OverviewApp.vue')),
    defaultSize: { width: 920, height: 600 },
    isSingleInstance: true,
    plannedWorkflows: [],
  }),
  defineApp({
    id: 'sales-orders',
    icon: RiShoppingCart2Line,
    label: 'Sales orders',
    phase: 'Phase 4',
    group: 'sales',
    summary: 'Enter, price, check and release customer orders, from field sales apps or keyed in the back office.',
    keywords: ['orders', 'so', 'quotation', 'order to cash'],
    isPinned: true,
    component: defineAsyncComponent(() => import('./SalesOrdersApp.vue')),
    defaultSize: { width: 1300, height: 700 },
    isSingleInstance: false,
    plannedWorkflows: [],
  }),
  defineApp({
    id: 'pricing',
    icon: RiPriceTag3Line,
    label: 'Pricing',
    phase: 'Phase 2',
    group: 'sales',
    summary: 'Price lists, customer prices, discounts, free goods, listing and substitution rules.',
    keywords: ['price list', 'discount', 'free goods', 'conditions', 'blanket agreement'],
    isPinned: false,
    defaultSize: { width: 960, height: 620 },
    isSingleInstance: true,
    plannedWorkflows: [
      {
        title: 'Price an order line',
        steps: [
          'Read the pricing procedure for the sales area and order type',
          'Search condition records from the most specific key to the most general',
          'Apply the first valid record, its scales and rounding rules',
          'Add free goods, tax and subtotals, then show every step in the simulator',
        ],
      },
      {
        title: 'Publish a price change',
        steps: ['Create condition records with validity dates', 'Approve the change', 'Publish the new price list to connected field sales apps'],
      },
    ],
  }),
  defineApp({
    id: 'credit-control',
    icon: RiShieldCheckLine,
    label: 'Credit control',
    phase: 'Phase 4',
    group: 'finance',
    summary: 'Credit limits, exposure and the worklist of blocked orders waiting for release.',
    keywords: ['credit', 'limit', 'block', 'release', 'exposure'],
    isPinned: true,
    defaultSize: { width: 1000, height: 620 },
    isSingleInstance: true,
    plannedWorkflows: [
      {
        title: 'Release a credit-blocked order',
        steps: [
          'An order exceeds the limit or the customer has overdue items',
          'It appears in the worklist with exposure, ageing and payment history',
          'Release, reject or raise the limit (with approval when required)',
          'Connected field apps receive the new status and the rep sees it on the phone',
        ],
      },
    ],
  }),
  defineApp({
    id: 'invoices',
    icon: RiFileList3Line,
    label: 'Invoices',
    phase: 'Phase 4',
    group: 'finance',
    summary: 'Invoices, credit notes and their eTIMS or EFRIS submission status.',
    keywords: ['billing', 'invoice', 'credit note', 'etims', 'efris', 'tax'],
    isPinned: false,
    defaultSize: { width: 1080, height: 640 },
    isSingleInstance: false,
    plannedWorkflows: [
      {
        title: 'Invoice delivered goods',
        steps: [
          'The billing run collects deliveries that have left the warehouse',
          'Invoices are combined or split by payer, tax and currency rules',
          'Each invoice posts to the ledger and is signed by the tax authority',
          'The signed invoice and its QR data flow back to connected systems',
        ],
      },
    ],
  }),
  defineApp({
    id: 'collections',
    icon: RiWallet3Line,
    label: 'Collections',
    phase: 'Phase 4',
    group: 'finance',
    summary: 'Payments from cash, M-Pesa, cheques and banks, matched to invoices.',
    keywords: ['payments', 'receipts', 'mpesa', 'cash', 'cheque', 'statement', 'ageing'],
    isPinned: false,
    defaultSize: { width: 1040, height: 640 },
    isSingleInstance: true,
    plannedWorkflows: [
      {
        title: 'Apply a payment',
        steps: [
          'A payment arrives from a field app, an M-Pesa confirmation or a bank statement',
          'xBO proposes the invoices it settles, oldest first',
          'Differences become unallocated credit or a deduction to investigate',
        ],
      },
    ],
  }),
  defineApp({
    id: 'stock',
    icon: RiBox3Line,
    label: 'Stock',
    phase: 'Phase 5',
    group: 'inventory',
    summary: 'Stock by warehouse, van and batch, with expiry dates and every movement.',
    keywords: ['inventory', 'batch', 'expiry', 'fefo', 'warehouse', 'transfer', 'stock take'],
    isPinned: true,
    defaultSize: { width: 1080, height: 640 },
    isSingleInstance: false,
    plannedWorkflows: [
      {
        title: 'Pick by first expiry',
        steps: [
          'A delivery needs 40 cases of a batch-managed product',
          'xBO skips batches below the customer’s minimum remaining shelf life',
          'It picks the earliest-expiring batches first and splits lines when needed',
        ],
      },
      {
        title: 'Count stock',
        steps: ['Freeze the location', 'Count on screen or on a phone', 'Review variances and post them with a reason'],
      },
    ],
  }),
  defineApp({
    id: 'route-settlement',
    icon: RiTruckLine,
    label: 'Route settlement',
    phase: 'Phase 6',
    group: 'logistics',
    summary: 'Load vans, check them back in and reconcile stock, cash and empties per route.',
    keywords: ['van sales', 'dsd', 'route', 'settlement', 'check-in', 'check-out', 'trip'],
    isPinned: true,
    defaultSize: { width: 1120, height: 660 },
    isSingleInstance: false,
    plannedWorkflows: [
      {
        title: 'Settle a route',
        steps: [
          'Compare what was loaded with what was sold, returned and counted at check-in',
          'Compare expected cash, M-Pesa and cheques with what the driver handed in',
          'Reconcile empties issued and collected',
          'Post variances to the driver or write them off with approval',
        ],
      },
    ],
  }),
  defineApp({
    id: 'empties',
    icon: RiRecycleLine,
    label: 'Empties',
    phase: 'Phase 6',
    group: 'logistics',
    summary: 'Crates, bottles, kegs and pallets: deposits and balances per customer.',
    keywords: ['returnable', 'crates', 'bottles', 'deposit', 'pallets'],
    isPinned: false,
    defaultSize: { width: 900, height: 600 },
    isSingleInstance: true,
    plannedWorkflows: [
      {
        title: 'Track an empties balance',
        steps: ['Each delivery issues empties linked to the full product', 'Each pickup returns them', 'Balances are billed or credited by deposit rules'],
      },
    ],
  }),
  defineApp({
    id: 'customers',
    icon: RiStore2Line,
    label: 'Customers',
    phase: 'Phase 1',
    group: 'master-data',
    summary: 'Outlets, chains and hierarchies, with routes, price lists and credit terms.',
    keywords: ['outlets', 'shops', 'accounts', 'hierarchy', 'ship-to'],
    isPinned: false,
    defaultSize: { width: 1060, height: 640 },
    isSingleInstance: true,
    plannedWorkflows: [
      {
        title: 'Onboard an outlet created in the field',
        steps: ['A rep creates the outlet in a field sales app', 'xBO receives it for review', 'Assign price list, terms and credit, then approve'],
      },
    ],
  }),
  defineApp({
    id: 'products',
    icon: RiBox3Line,
    label: 'Products',
    phase: 'Phase 1',
    group: 'master-data',
    summary: 'Products with units, barcodes, shelf life, tax codes and empties.',
    keywords: ['items', 'sku', 'uom', 'barcode', 'catalogue'],
    isPinned: false,
    defaultSize: { width: 1060, height: 640 },
    isSingleInstance: true,
    plannedWorkflows: [
      {
        title: 'Introduce a new SKU',
        steps: ['Define units and barcodes', 'Set shelf life and tax codes', 'Link empties and publish to connected apps'],
      },
    ],
  }),
  defineApp({
    id: 'integration-hub',
    icon: RiPlugLine,
    label: 'Integration hub',
    phase: 'Phase 3',
    group: 'integration',
    summary: 'Every exchange with external systems, by direction, with status and replay.',
    keywords: ['sync', 'integration', 'api', 'webhook', 'connector'],
    isPinned: true,
    component: defineAsyncComponent(() => import('./IntegrationApp.vue')),
    defaultSize: { width: 1160, height: 680 },
    isSingleInstance: true,
    plannedWorkflows: [],
  }),
  defineApp({
    id: 'settings',
    icon: RiSettings3Line,
    label: 'Settings',
    phase: null,
    group: 'system',
    summary: 'Appearance, window controls and density.',
    keywords: ['preferences', 'theme', 'dark', 'appearance'],
    isPinned: false,
    component: defineAsyncComponent(() => import('./SettingsApp.vue')),
    defaultSize: { width: 760, height: 520 },
    isSingleInstance: true,
    plannedWorkflows: [],
  }),
  defineApp({
    id: 'about',
    icon: RiInformationLine,
    label: 'About xBO',
    phase: null,
    group: 'system',
    summary: 'Version and runtime.',
    keywords: ['version'],
    isPinned: false,
    component: defineAsyncComponent(() => import('./AboutApp.vue')),
    defaultSize: { width: 440, height: 360 },
    isSingleInstance: true,
    plannedWorkflows: [],
  }),
];

export function findApp(appId: string): AppDefinition | undefined {
  return apps.find((app) => app.id === appId);
}

export function appsInGroup(groupId: ModuleGroupId): AppDefinition[] {
  return apps.filter((app) => app.group === groupId);
}
