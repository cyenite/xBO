<script setup lang="ts">
import { computed, ref } from 'vue';
import { RiCheckLine, RiSearchLine } from '../icons';
import DataGrid, { type GridColumn } from '../components/DataGrid.vue';
import SegmentedControl from '../components/SegmentedControl.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { buildSampleOrders, kes, quantityFormat, statusMeta, type OrderStatus, type SalesOrder } from './sampleData';

const viewOptions = [
  { value: 'all', label: 'All' },
  { value: 'attention', label: 'Needs action' },
  { value: 'open', label: 'Open' },
  { value: 'invoiced', label: 'Invoiced' },
] as const;

type OrderView = (typeof viewOptions)[number]['value'];

const statusesByView: Record<Exclude<OrderView, 'all'>, OrderStatus[]> = {
  attention: ['credit-block', 'short-stock', 'draft'],
  open: ['confirmed', 'delivered'],
  invoiced: ['invoiced'],
};

const orders = buildSampleOrders();

const query = ref('');
const view = ref<OrderView>('all');
const selectedNumber = ref<string | null>(orders[0]?.number ?? null);

const visibleOrders = computed(() => {
  const needle = query.value.trim().toLowerCase();

  return orders.filter((order) => {
    const isInView = view.value === 'all' || statusesByView[view.value].includes(order.status);
    const isMatch = needle === '' || [order.number, order.customer, order.route, order.salesRep].some((text) => text.toLowerCase().includes(needle));

    return isInView && isMatch;
  });
});

const selected = computed(() => orders.find((order) => order.number === selectedNumber.value) ?? null);
const vatAmount = computed(() => (selected.value ? selected.value.amount - selected.value.amount / 1.16 : 0));

const columns: GridColumn<SalesOrder>[] = [
  { key: 'number', label: 'Order', width: '108px' },
  { key: 'date', label: 'Date', width: '96px', isNumeric: true },
  { key: 'customer', label: 'Customer', width: 'minmax(180px, 1.6fr)' },
  { key: 'route', label: 'Route', width: 'minmax(104px, 0.8fr)' },
  { key: 'salesRep', label: 'Sales rep', width: 'minmax(96px, 0.8fr)' },
  { key: 'source', label: 'Source', width: '92px' },
  { key: 'status', label: 'Status', width: '124px' },
  { key: 'lineCount', label: 'Lines', width: '52px', align: 'end', isNumeric: true },
  { key: 'amount', label: 'Amount', width: '132px', align: 'end', isNumeric: true, format: (value) => kes.format(Number(value)) },
];

const flowSteps = computed(() => {
  const status = selected.value?.status;
  const delivered = status === 'delivered' || status === 'invoiced';

  return [
    {
      label: 'Sales order',
      detail: status === 'draft' ? 'Draft' : status === 'credit-block' ? 'Blocked by credit check' : 'Confirmed',
      state: status === 'draft' || status === 'credit-block' ? 'current' : 'done',
    },
    {
      label: 'Delivery',
      detail: delivered ? 'Goods issued' : status === 'short-stock' ? 'Waiting for stock' : 'Not started',
      state: delivered ? 'done' : status === 'short-stock' || status === 'confirmed' ? 'current' : 'pending',
    },
    {
      label: 'Invoice',
      detail: status === 'invoiced' ? 'Posted and signed (eTIMS)' : 'Not started',
      state: status === 'invoiced' ? 'done' : status === 'delivered' ? 'current' : 'pending',
    },
  ] as const;
});
</script>

<template>
  <div class="@container flex h-full flex-col">
    <div class="flex h-11 shrink-0 items-center gap-3 border-b border-hairline bg-chrome px-3">
      <label class="flex h-7 w-[min(280px,40cqw)] items-center gap-2 rounded-sm bg-window px-2 ring-1 ring-field-border focus-within:ring-2 focus-within:ring-primary">
        <RiSearchLine width="14" height="14" class="shrink-0 text-ink-muted" aria-hidden="true" />
        <span class="sr-only">Search orders</span>
        <input v-model="query" type="search" class="min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-ink-subtle" placeholder="Order, customer, route or rep" />
      </label>
      <SegmentedControl v-model="view" label="Show orders" :options="viewOptions" />
      <span class="figures ml-auto text-caption text-ink-muted">{{ visibleOrders.length }} of {{ orders.length }} orders</span>
      <span class="rounded-xs bg-warning-soft px-1.5 text-caption font-medium text-warning" title="These records are illustrative until the sales API exists (plan Phase 4).">Sample data</span>
    </div>

    <div class="flex min-h-0 flex-1">
      <div class="min-w-0 flex-1">
        <DataGrid v-model:selected="selectedNumber" :rows="visibleOrders" :columns="columns" row-key="number" label="Sales orders">
          <template #cell-status="{ row }">
            <StatusBadge :tone="statusMeta(row.status).tone" :label="statusMeta(row.status).label" />
          </template>
          <template #cell-number="{ row }">
            <span class="font-medium text-ink">{{ row.number }}</span>
          </template>
          <template #empty>
            <div class="px-6 py-12 text-center">
              <p class="text-body font-medium text-ink">No orders match these filters</p>
              <p class="mt-1 text-caption text-ink-muted">Clear the search or switch to “All” to see every order.</p>
            </div>
          </template>
        </DataGrid>
      </div>

      <aside class="flex w-[340px] shrink-0 flex-col border-l border-hairline bg-window @max-[860px]:hidden" aria-label="Order details">
        <template v-if="selected">
          <div class="border-b border-hairline px-5 pt-4 pb-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="selectable text-display font-semibold text-ink">{{ selected.number }}</h3>
                <p class="mt-0.5 text-body text-ink-muted">{{ selected.customer }}</p>
              </div>
              <StatusBadge :tone="statusMeta(selected.status).tone" :label="statusMeta(selected.status).label" />
            </div>
            <dl class="mt-4 grid grid-cols-[88px_1fr] gap-x-3 gap-y-1.5 text-body">
              <dt class="text-ink-muted">Date</dt><dd class="figures">{{ selected.date }}</dd>
              <dt class="text-ink-muted">Route</dt><dd>{{ selected.route }}</dd>
              <dt class="text-ink-muted">Sales rep</dt><dd>{{ selected.salesRep }}</dd>
              <dt class="text-ink-muted">Source</dt><dd>{{ selected.source }}</dd>
            </dl>
          </div>

          <div class="border-b border-hairline px-5 py-4">
            <h4 class="text-label text-ink-muted">Document flow</h4>
            <ol class="mt-2.5 flex flex-col gap-2.5">
              <li v-for="step in flowSteps" :key="step.label" class="flex items-center gap-2.5">
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
                  <span class="text-caption text-ink-muted">{{ step.detail }}</span>
                </span>
              </li>
            </ol>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <h4 class="text-label text-ink-muted">{{ selected.lineCount }} {{ selected.lineCount === 1 ? 'line' : 'lines' }}</h4>
            <ul class="mt-2 flex flex-col">
              <li v-for="(line, index) in selected.lines" :key="`${line.sku}-${index}`" class="flex items-baseline gap-3 border-b border-hairline py-2 last:border-b-0">
                <span class="flex min-w-0 flex-1 flex-col">
                  <span class="truncate text-body text-ink">{{ line.product }}</span>
                  <span class="figures text-caption text-ink-muted">{{ quantityFormat.format(line.quantity) }} × {{ line.unit }} at {{ kes.format(line.unitPrice) }}</span>
                </span>
                <span class="figures text-body text-ink">{{ kes.format(line.amount) }}</span>
              </li>
            </ul>
          </div>

          <dl class="figures grid grid-cols-[1fr_auto] gap-y-1 border-t border-hairline bg-chrome px-5 py-3 text-body">
            <dt class="text-ink-muted">VAT included (16%)</dt><dd class="text-right">{{ kes.format(vatAmount) }}</dd>
            <dt class="font-semibold text-ink">Total</dt><dd class="text-right font-semibold text-ink">{{ kes.format(selected.amount) }}</dd>
          </dl>
        </template>

        <div v-else class="m-auto max-w-[240px] px-6 text-center">
          <p class="text-body font-medium text-ink">Select an order</p>
          <p class="mt-1 text-caption text-ink-muted">Its lines, totals and document flow appear here. Use ↑ and ↓ to move through the list.</p>
        </div>
      </aside>
    </div>
  </div>
</template>
