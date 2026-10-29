<script setup lang="ts">
import { computed, ref } from 'vue';
import { RiCheckLine, RiSearchLine } from '../icons';
import DataGrid, { type GridColumn } from '../components/DataGrid.vue';
import SegmentedControl from '../components/SegmentedControl.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { buildSampleUnits, kes, statusMeta, type RentRollUnit, type UnitStatus } from './sampleData';

const viewOptions = [
  { value: 'all', label: 'All' },
  { value: 'attention', label: 'Needs action' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'vacant', label: 'Vacant' },
] as const;

type UnitView = (typeof viewOptions)[number]['value'];

const statusesByView: Record<Exclude<UnitView, 'all'>, UnitStatus[]> = {
  attention: ['arrears', 'renewal-due', 'notice-given'],
  occupied: ['current', 'arrears', 'renewal-due', 'notice-given'],
  vacant: ['vacant'],
};

const units = buildSampleUnits();

const query = ref('');
const view = ref<UnitView>('all');
const selectedUnit = ref<string | null>(units[0]?.unit ?? null);

const visibleUnits = computed(() => {
  const needle = query.value.trim().toLowerCase();

  return units.filter((unit) => {
    const isInView = view.value === 'all' || statusesByView[view.value].includes(unit.status);
    const isMatch = needle === '' || [unit.unit, unit.property, unit.tenant ?? ''].some((text) => text.toLowerCase().includes(needle));

    return isInView && isMatch;
  });
});

const selected = computed(() => units.find((unit) => unit.unit === selectedUnit.value) ?? null);
const recentLedger = computed(() => [...(selected.value?.ledger ?? [])].reverse());

const columns: GridColumn<RentRollUnit>[] = [
  { key: 'unit', label: 'Unit', width: '88px' },
  { key: 'property', label: 'Property', width: 'minmax(140px, 1fr)' },
  { key: 'unitType', label: 'Type', width: '96px' },
  { key: 'tenant', label: 'Tenant', width: 'minmax(160px, 1.4fr)', format: (value) => (value === null ? 'No tenant' : String(value)) },
  { key: 'leaseEnd', label: 'Lease ends', width: '96px', isNumeric: true, format: (value) => (value === null ? '' : String(value)) },
  { key: 'status', label: 'Status', width: '124px' },
  { key: 'rent', label: 'Monthly rent', width: '124px', align: 'end', isNumeric: true, format: (value) => kes.format(Number(value)) },
  { key: 'balance', label: 'Balance', width: '124px', align: 'end', isNumeric: true, format: (value) => kes.format(Number(value)) },
];

const leaseSteps = computed(() => {
  const unit = selected.value;
  const isVacant = unit?.status === 'vacant';
  const isLeaving = unit?.status === 'notice-given';
  const isRenewalDue = unit?.status === 'renewal-due';
  const isInArrears = unit?.status === 'arrears';

  return [
    {
      label: 'Lease',
      detail: isVacant ? 'No active lease' : `Started ${unit?.leaseStart}`,
      state: isVacant ? 'current' : 'done',
    },
    {
      label: 'Rent this month',
      detail: isVacant ? 'Not billed' : isInArrears ? 'Unpaid' : 'Invoiced and paid',
      state: isVacant ? 'pending' : isInArrears ? 'current' : 'done',
    },
    {
      label: isLeaving ? 'Move-out' : 'Renewal',
      detail: isVacant ? 'Not started' : isLeaving ? `Leaving by ${unit?.leaseEnd}` : `Lease ends ${unit?.leaseEnd}`,
      state: isLeaving || isRenewalDue ? 'current' : 'pending',
    },
  ] as const;
});
</script>

<template>
  <div class="@container flex h-full flex-col">
    <div class="flex h-11 shrink-0 items-center gap-3 border-b border-hairline bg-chrome px-3">
      <label class="flex h-7 w-[min(280px,40cqw)] items-center gap-2 rounded-sm bg-window px-2 ring-1 ring-field-border focus-within:ring-2 focus-within:ring-primary">
        <RiSearchLine width="14" height="14" class="shrink-0 text-ink-muted" aria-hidden="true" />
        <span class="sr-only">Search units</span>
        <input v-model="query" type="search" class="min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-ink-subtle" placeholder="Unit, property or tenant" />
      </label>
      <SegmentedControl v-model="view" label="Show units" :options="viewOptions" />
      <span class="figures ml-auto text-caption text-ink-muted">{{ visibleUnits.length }} of {{ units.length }} units</span>
      <span class="rounded-xs bg-warning-soft px-1.5 text-caption font-medium text-warning" title="These records are illustrative until the billing API exists (plan Phase 3).">Sample data</span>
    </div>

    <div class="flex min-h-0 flex-1">
      <div class="min-w-0 flex-1">
        <DataGrid v-model:selected="selectedUnit" :rows="visibleUnits" :columns="columns" row-key="unit" label="Rent roll">
          <template #cell-status="{ row }">
            <StatusBadge :tone="statusMeta(row.status).tone" :label="statusMeta(row.status).label" />
          </template>
          <template #cell-unit="{ row }">
            <span class="font-medium text-ink">{{ row.unit }}</span>
          </template>
          <template #empty>
            <div class="px-6 py-12 text-center">
              <p class="text-body font-medium text-ink">No units match these filters</p>
              <p class="mt-1 text-caption text-ink-muted">Clear the search or switch to “All” to see every unit.</p>
            </div>
          </template>
        </DataGrid>
      </div>

      <aside class="flex w-[340px] shrink-0 flex-col border-l border-hairline bg-window @max-[860px]:hidden" aria-label="Unit details">
        <template v-if="selected">
          <div class="border-b border-hairline px-5 pt-4 pb-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="selectable text-display font-semibold text-ink">{{ selected.unit }}</h3>
                <p class="mt-0.5 text-body text-ink-muted">{{ selected.tenant ?? 'No tenant' }}</p>
              </div>
              <StatusBadge :tone="statusMeta(selected.status).tone" :label="statusMeta(selected.status).label" />
            </div>
            <dl class="mt-4 grid grid-cols-[88px_1fr] gap-x-3 gap-y-1.5 text-body">
              <dt class="text-ink-muted">Property</dt><dd>{{ selected.property }}</dd>
              <dt class="text-ink-muted">Type</dt><dd>{{ selected.unitType }}</dd>
              <template v-if="selected.leaseStart">
                <dt class="text-ink-muted">Lease</dt><dd class="figures">{{ selected.leaseStart }} to {{ selected.leaseEnd }}</dd>
              </template>
            </dl>
          </div>

          <div class="border-b border-hairline px-5 py-4">
            <h4 class="text-label text-ink-muted">Lease</h4>
            <ol class="mt-2.5 flex flex-col gap-2.5">
              <li v-for="step in leaseSteps" :key="step.label" class="flex items-center gap-2.5">
                <span
                  class="grid size-5 shrink-0 place-items-center rounded-full"
                  :class="{
                    'bg-primary text-on-primary': step.state === 'done',
                    'ring-2 ring-primary ring-inset': step.state === 'current',
                    'ring-1 ring-field-border ring-inset': step.state === 'pending',
                  }"
                >
                  <RiCheckLine v-if="step.state === 'done'" width="12" height="12" aria-hidden="true" />
                </span>
                <span class="flex min-w-0 flex-col">
                  <span class="text-body font-medium" :class="step.state === 'pending' ? 'text-ink-muted' : 'text-ink'">{{ step.label }}</span>
                  <span class="figures text-caption text-ink-muted">{{ step.detail }}</span>
                </span>
              </li>
            </ol>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <h4 class="text-label text-ink-muted">Recent charges and payments</h4>
            <ul v-if="recentLedger.length > 0" class="mt-2 flex flex-col">
              <li v-for="(entry, index) in recentLedger" :key="`${entry.date}-${index}`" class="flex items-baseline gap-3 border-b border-hairline py-2 last:border-b-0">
                <span class="flex min-w-0 flex-1 flex-col">
                  <span class="truncate text-body text-ink">{{ entry.description }}</span>
                  <span class="figures text-caption text-ink-muted">{{ entry.date }}</span>
                </span>
                <span class="figures text-body" :class="entry.amount < 0 ? 'text-success' : 'text-ink'">{{ kes.format(entry.amount) }}</span>
              </li>
            </ul>
            <p v-else class="mt-2 text-caption text-ink-muted">Nothing billed while the unit is vacant.</p>
          </div>

          <dl class="figures grid grid-cols-[1fr_auto] gap-y-1 border-t border-hairline bg-chrome px-5 py-3 text-body">
            <dt class="text-ink-muted">Monthly rent</dt><dd class="text-right">{{ kes.format(selected.rent) }}</dd>
            <dt class="font-semibold text-ink">Balance due</dt>
            <dd class="text-right font-semibold" :class="selected.balance > 0 ? 'text-danger' : 'text-ink'">{{ kes.format(selected.balance) }}</dd>
          </dl>
        </template>

        <div v-else class="m-auto max-w-[240px] px-6 text-center">
          <p class="text-body font-medium text-ink">Select a unit</p>
          <p class="mt-1 text-caption text-ink-muted">Its lease, recent charges and payments, and balance appear here. Use ↑ and ↓ to move through the list.</p>
        </div>
      </aside>
    </div>
  </div>
</template>
