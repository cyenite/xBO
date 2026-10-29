<script setup lang="ts">
import { computed } from 'vue';
import { useIntervalFn, useNow } from '@vueuse/core';
import { RiArrowRightLine } from '../icons';
import StatusBadge from '../components/StatusBadge.vue';
import type { StatusTone } from '../components/status';
import { useWindowsStore } from '../stores/windows';
import { buildSampleUnits, kes, statusMeta } from './sampleData';

interface AttentionItem {
  id: string;
  tone: StatusTone;
  appId: string;
  title: string;
  label: string;
  action: string;
  detail: string;
}

const windows = useWindowsStore();
const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 60_000) });

const dateLabel = computed(() => new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(now.value));

const attention: AttentionItem[] = [
  {
    id: 'arrears',
    tone: 'danger',
    appId: 'collections',
    title: '9 tenants are more than 30 days in arrears',
    label: 'Arrears',
    action: 'Chase arrears',
    detail: `${kes.format(612_400)} outstanding, 3 of them at Riverside Court`,
  },
  {
    id: 'unmatched',
    tone: 'danger',
    appId: 'integration-hub',
    title: '4 M-Pesa payments could not be matched',
    label: 'Unmatched',
    action: 'Match payments',
    detail: 'The account reference did not match any unit or tenant',
  },
  {
    id: 'maintenance',
    tone: 'warning',
    appId: 'maintenance',
    title: '5 work orders waiting for owner approval',
    label: 'Waiting',
    action: 'Review work orders',
    detail: 'Oldest: water heater replacement at Kilimani Heights, 3 days',
  },
  {
    id: 'renewals',
    tone: 'warning',
    appId: 'leases',
    title: '7 leases end within 60 days',
    label: 'Renewal',
    action: 'Review renewals',
    detail: '2 tenants have given notice; 5 have not replied to the renewal offer',
  },
  {
    id: 'billing',
    tone: 'info',
    appId: 'invoices',
    title: 'November billing run is ready for review',
    label: 'Draft',
    action: 'Open billing run',
    detail: '41 invoices, water readings for Lavington Gardens still missing',
  },
];

const recentUnits = buildSampleUnits(7);
</script>

<template>
  <div class="@container h-full overflow-y-auto">
    <div class="mx-auto flex max-w-[1080px] flex-col gap-7 px-7 pt-6 pb-8">
      <header class="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 class="text-display font-semibold text-ink">{{ dateLabel }}</h3>
          <p class="mt-0.5 text-body text-ink-muted">Demo Property Managers Ltd, 4 properties, 46 units</p>
        </div>
        <span class="rounded-xs bg-warning-soft px-1.5 text-caption font-medium text-warning" title="Illustrative until the operational modules exist.">Sample data</span>
      </header>

      <div class="grid gap-7 @min-[880px]:grid-cols-[1.35fr_1fr]">
        <section aria-labelledby="attention-heading">
          <h4 id="attention-heading" class="text-title font-semibold text-ink">Needs attention</h4>
          <ul class="mt-3 flex flex-col overflow-hidden rounded-md ring-1 ring-hairline">
            <li v-for="item in attention" :key="item.id" class="border-b border-hairline last:border-b-0">
              <button type="button" class="attention-row group" @click="windows.open(item.appId)">
                <StatusBadge :tone="item.tone" :label="item.label" class="w-[92px] justify-center" />
                <span class="flex min-w-0 flex-1 flex-col text-left">
                  <span class="text-body font-medium text-ink">{{ item.title }}</span>
                  <span class="truncate text-caption text-ink-muted">{{ item.detail }}</span>
                </span>
                <span class="flex shrink-0 items-center gap-1 text-caption font-medium text-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {{ item.action }}<RiArrowRightLine width="14" height="14" aria-hidden="true" />
                </span>
              </button>
            </li>
          </ul>
        </section>

        <section aria-labelledby="recent-heading">
          <div class="flex items-baseline justify-between">
            <h4 id="recent-heading" class="text-title font-semibold text-ink">Units</h4>
            <button type="button" class="text-caption font-medium text-primary hover:underline" @click="windows.open('rent-roll')">Rent roll</button>
          </div>
          <ul class="mt-3 flex flex-col">
            <li v-for="unit in recentUnits" :key="unit.unit" class="flex items-center gap-3 border-b border-hairline py-2 last:border-b-0">
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="truncate text-body text-ink">{{ unit.tenant ?? 'No tenant' }}</span>
                <span class="figures text-caption text-ink-muted">{{ unit.unit }}, {{ unit.property }}</span>
              </span>
              <StatusBadge :tone="statusMeta(unit.status).tone" :label="statusMeta(unit.status).label" />
              <span class="figures w-[112px] text-right text-body text-ink">{{ kes.format(unit.balance) }}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.attention-row {
  display: flex;
  width: 100%;
  min-height: 52px;
  align-items: center;
  gap: 14px;
  padding: 8px 14px;
  background: var(--xbo-window);
  transition: background-color 120ms linear;
}

.attention-row:hover {
  background: var(--xbo-hover);
}

.attention-row:focus-visible {
  outline-offset: -2px;
}
</style>
