import { defineAsyncComponent, markRaw, type Component } from 'vue';
import {
  RiBankLine,
  RiBuilding2Line,
  RiClipboardLine,
  RiFileList3Line,
  RiFileTextLine,
  RiGroupLine,
  RiInformationLine,
  RiLayoutMasonryLine,
  RiPlugLine,
  RiSettings3Line,
  RiTableLine,
  RiToolsLine,
  RiUserStarLine,
  RiWallet3Line,
} from '../icons';

export const moduleGroups = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'leasing', label: 'Leasing' },
  { id: 'finance', label: 'Finance' },
  { id: 'operations', label: 'Operations' },
  { id: 'portfolio', label: 'Portfolio' },
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
    summary: 'What needs your attention today across leases, arrears, maintenance and integration.',
    keywords: ['home', 'today', 'attention', 'queue'],
    isPinned: true,
    defaultSize: { width: 920, height: 600 },
    isSingleInstance: true,
    plannedWorkflows: [],
  }),
  defineApp({
    id: 'rent-roll',
    icon: RiTableLine,
    label: 'Rent roll',
    phase: 'Phase 3',
    group: 'leasing',
    summary: 'Every unit with its tenant, rent, balance and lease status, across all properties.',
    keywords: ['units', 'occupancy', 'arrears', 'balance', 'vacant'],
    isPinned: true,
    defaultSize: { width: 1300, height: 700 },
    isSingleInstance: false,
    plannedWorkflows: [],
  }),
  defineApp({
    id: 'leases',
    icon: RiFileTextLine,
    label: 'Leases',
    phase: 'Phase 2',
    group: 'leasing',
    summary: 'Lease terms, rent and charges, deposits, renewals, notices and move-outs.',
    keywords: ['tenancy', 'agreement', 'renewal', 'notice', 'move-in', 'move-out', 'deposit', 'escalation'],
    isPinned: true,
    defaultSize: { width: 1080, height: 660 },
    isSingleInstance: false,
    plannedWorkflows: [
      {
        title: 'Let a vacant unit',
        steps: [
          'Record the applicant, their documents and any guarantor',
          'Draft the lease: term, rent, escalation, deposit, recurring charges and billing day',
          'Sign it, invoice the deposit and first rent, and mark the unit reserved',
          'Run the move-in inspection, hand over keys and start billing',
        ],
      },
      {
        title: 'End a lease',
        steps: [
          'Record the notice and the planned move-out date',
          'Run the move-out inspection and price any damage',
          'Settle the final account against the deposit and refund or invoice the difference',
        ],
      },
    ],
  }),
  defineApp({
    id: 'tenants',
    icon: RiGroupLine,
    label: 'Tenants',
    phase: 'Phase 2',
    group: 'leasing',
    summary: 'People and companies renting units, with contacts, documents and statements.',
    keywords: ['residents', 'occupants', 'contacts', 'statement', 'guarantor'],
    isPinned: false,
    defaultSize: { width: 1060, height: 640 },
    isSingleInstance: true,
    plannedWorkflows: [
      {
        title: 'Send a tenant statement',
        steps: ['Pick the tenant and the period', 'Review charges, payments and the running balance', 'Email or print the statement'],
      },
    ],
  }),
  defineApp({
    id: 'invoices',
    icon: RiFileList3Line,
    label: 'Invoices',
    phase: 'Phase 3',
    group: 'finance',
    summary: 'Monthly billing runs for rent, service charges and metered utilities, plus credit notes.',
    keywords: ['billing', 'invoice', 'credit note', 'service charge', 'water', 'utilities', 'etims', 'penalty'],
    isPinned: false,
    defaultSize: { width: 1080, height: 640 },
    isSingleInstance: false,
    plannedWorkflows: [
      {
        title: 'Run monthly billing',
        steps: [
          'Collect every active lease whose billing day falls in the run',
          'Add rent with any escalation due, recurring charges and metered readings',
          'Review the draft run, then post it to the ledger',
          'Send invoices to tenants by email or SMS',
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
    summary: 'Payments from M-Pesa, banks, cheques and cash, matched to tenants, plus arrears follow-up.',
    keywords: ['payments', 'receipts', 'mpesa', 'paybill', 'bank', 'cheque', 'arrears', 'reminders', 'ageing'],
    isPinned: true,
    defaultSize: { width: 1040, height: 640 },
    isSingleInstance: true,
    plannedWorkflows: [
      {
        title: 'Match a payment',
        steps: [
          'A payment arrives from an M-Pesa confirmation, a bank feed or the cashier',
          'xBO reads the account reference and matches it to a unit or tenant',
          'It settles the oldest open invoices first and keeps any excess as credit',
          'Payments it cannot match wait in a worklist for a clerk',
        ],
      },
      {
        title: 'Chase arrears',
        steps: ['Review balances by age', 'Send reminders by SMS or email', 'Issue demand letters or apply late-payment penalties by policy'],
      },
    ],
  }),
  defineApp({
    id: 'owner-statements',
    icon: RiBankLine,
    label: 'Owner statements',
    phase: 'Phase 6',
    group: 'finance',
    summary: 'Rent collected, fees and expenses per owner, and the remittance due to them.',
    keywords: ['landlord', 'remittance', 'management fee', 'disbursement', 'trust'],
    isPinned: false,
    defaultSize: { width: 1040, height: 640 },
    isSingleInstance: true,
    plannedWorkflows: [
      {
        title: 'Close an owner month',
        steps: [
          'Total rent and charges collected for the owner’s units',
          'Deduct the management fee and the expenses approved against the owner',
          'Approve the statement and pay the remittance',
        ],
      },
    ],
  }),
  defineApp({
    id: 'maintenance',
    icon: RiToolsLine,
    label: 'Maintenance',
    phase: 'Phase 7',
    group: 'operations',
    summary: 'Work orders from tenants and inspections, with contractors, quotes, approvals and costs.',
    keywords: ['repairs', 'work order', 'ticket', 'contractor', 'vendor', 'quote'],
    isPinned: true,
    defaultSize: { width: 1080, height: 640 },
    isSingleInstance: true,
    plannedWorkflows: [
      {
        title: 'Fix a reported fault',
        steps: [
          'A tenant reports a fault, or an inspection raises one',
          'Assign a contractor and approve the quote (owner approval above a set amount)',
          'Close the work order with photos and the contractor’s bill',
          'Charge the cost to the owner or recover it from the tenant',
        ],
      },
    ],
  }),
  defineApp({
    id: 'inspections',
    icon: RiClipboardLine,
    label: 'Inspections',
    phase: 'Phase 7',
    group: 'operations',
    summary: 'Move-in, move-out and routine inspections with room-by-room condition and photos.',
    keywords: ['condition', 'check-in', 'check-out', 'move-in', 'move-out', 'photos'],
    isPinned: false,
    defaultSize: { width: 960, height: 620 },
    isSingleInstance: false,
    plannedWorkflows: [
      {
        title: 'Compare move-in and move-out',
        steps: ['Open both inspections side by side', 'Mark items damaged beyond fair wear', 'Price the damage and add it to the final account'],
      },
    ],
  }),
  defineApp({
    id: 'properties',
    icon: RiBuilding2Line,
    label: 'Properties and units',
    phase: 'Phase 1',
    group: 'portfolio',
    summary: 'Properties, blocks and units, with unit types, meters and standard charges.',
    keywords: ['buildings', 'estates', 'units', 'apartments', 'shops', 'meters', 'amenities'],
    isPinned: false,
    defaultSize: { width: 1060, height: 640 },
    isSingleInstance: true,
    plannedWorkflows: [
      {
        title: 'Add a property',
        steps: ['Create the property and link its owner', 'Add blocks and units, or import them from a spreadsheet', 'Set standard rent, charges and meters per unit type'],
      },
    ],
  }),
  defineApp({
    id: 'owners',
    icon: RiUserStarLine,
    label: 'Owners',
    phase: 'Phase 1',
    group: 'portfolio',
    summary: 'Landlords whose properties are managed, with fee terms and payout accounts.',
    keywords: ['landlords', 'investors', 'management agreement', 'payout'],
    isPinned: false,
    defaultSize: { width: 960, height: 620 },
    isSingleInstance: true,
    plannedWorkflows: [
      {
        title: 'Take on a new owner',
        steps: ['Record the owner and their payout account', 'Set the management fee and approval limits', 'Link the properties they own'],
      },
    ],
  }),
  defineApp({
    id: 'integration-hub',
    icon: RiPlugLine,
    label: 'Integration hub',
    phase: 'Phase 5',
    group: 'integration',
    summary: 'Every exchange with payment services, portals and other systems, by direction, with status and replay.',
    keywords: ['sync', 'integration', 'api', 'webhook', 'connector'],
    isPinned: true,
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
