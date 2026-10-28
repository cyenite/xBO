<script setup lang="ts">
import { computed, ref } from 'vue';
import { RiArrowLeftRightLine, RiDownloadCloud2Line, RiPlugLine, RiUploadCloud2Line } from '../icons';
import DataGrid, { type GridColumn } from '../components/DataGrid.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { integrationDirections, integrationPoints, type IntegrationDirectionId, type IntegrationPoint } from './integrationPoints';

const directionIcons = {
  inbound: RiDownloadCloud2Line,
  outbound: RiUploadCloud2Line,
  feeds: RiArrowLeftRightLine,
  gateways: RiPlugLine,
} satisfies Record<IntegrationDirectionId, unknown>;

type PointRow = IntegrationPoint & { key: string; status: string };

const directionId = ref<IntegrationDirectionId>('inbound');
const selectedKey = ref<string | null>(null);

const direction = computed(() => integrationDirections.find((candidate) => candidate.id === directionId.value) ?? integrationDirections[0]);
const rows = computed<PointRow[]>(() =>
  integrationPoints
    .filter((point) => point.direction === directionId.value)
    .map((point) => ({ ...point, key: `${point.direction}:${point.name}`, status: 'Planned' })),
);

const columns: GridColumn<PointRow>[] = [
  { key: 'name', label: 'Integration point', width: 'minmax(220px, 1.2fr)' },
  { key: 'target', label: 'Endpoint or event', width: 'minmax(260px, 1.6fr)' },
  { key: 'module', label: 'xBO module', width: '120px' },
  { key: 'status', label: 'Status', width: '132px' },
];

function countFor(id: IntegrationDirectionId): number {
  return integrationPoints.filter((point) => point.direction === id).length;
}
</script>

<template>
  <div class="flex h-full">
    <nav class="flex w-[220px] shrink-0 flex-col gap-0.5 border-r border-hairline bg-chrome p-2" aria-label="Directions">
      <p class="px-2 pt-1 pb-1.5 text-label text-ink-muted">Directions</p>
      <button
        v-for="item in integrationDirections"
        :key="item.id"
        type="button"
        class="flex h-8 items-center gap-2 rounded-sm px-2 text-left text-body transition-colors duration-150"
        :class="item.id === directionId ? 'bg-primary-soft font-medium text-primary' : 'text-ink hover:bg-hover'"
        :aria-current="item.id === directionId ? 'page' : undefined"
        @click="directionId = item.id"
      >
        <component :is="directionIcons[item.id]" width="15" height="15" aria-hidden="true" />
        <span class="flex-1 truncate">{{ item.label }}</span>
        <span class="figures text-caption text-ink-muted">{{ countFor(item.id) }}</span>
      </button>
    </nav>

    <section class="flex min-w-0 flex-1 flex-col" :aria-label="direction.label">
      <header class="border-b border-hairline px-5 py-3">
        <h3 class="text-title font-semibold text-ink">{{ direction.label }}</h3>
        <p class="mt-0.5 max-w-[80ch] text-caption text-ink-muted">{{ direction.summary }} Not built yet: the integration hub arrives in plan Phase 3.</p>
      </header>
      <div class="min-h-0 flex-1">
        <DataGrid v-model:selected="selectedKey" :rows="rows" :columns="columns" row-key="key" :label="`${direction.label} integration points`">
          <template #cell-target="{ row }">
            <span class="selectable font-mono text-caption text-ink-muted">{{ row.target }}</span>
          </template>
          <template #cell-status>
            <StatusBadge tone="neutral" label="Planned" />
          </template>
        </DataGrid>
      </div>
    </section>
  </div>
</template>
