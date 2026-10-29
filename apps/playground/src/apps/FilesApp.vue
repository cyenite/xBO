<script setup lang="ts">
import { computed, ref } from 'vue';
import { XboDataGrid, XboSegmentedControl, XboStatusBadge, useCurrentWindow, useFormat, type GridColumn, type StatusTone } from '@xbo-ui/vue';

interface FileRow {
  name: string;
  kind: string;
  size: number;
  status: 'synced' | 'pending' | 'conflict';
  folder: string;
  modified: string;
}

const statuses = [
  { value: 'synced', label: 'Synced', tone: 'success' },
  { value: 'pending', label: 'Waiting', tone: 'warning' },
  { value: 'conflict', label: 'Conflict', tone: 'danger' },
] as const satisfies readonly { value: FileRow['status']; label: string; tone: StatusTone }[];

const folders = ['Documents', 'Reports', 'Designs', 'Archive'];
const kinds = ['PDF document', 'Spreadsheet', 'Image', 'Text'];
const files: FileRow[] = Array.from({ length: 64 }, (_, index) => ({
  name: `${['Budget', 'Roadmap', 'Minutes', 'Invoice', 'Sketch', 'Notes'][index % 6]} ${String(index + 1).padStart(2, '0')}`,
  kind: kinds[index % kinds.length]!,
  size: ((index * 7919) % 9000) * 1024 + 2048,
  status: statuses[index % 7 === 0 ? 2 : index % 4 === 0 ? 1 : 0]!.value,
  folder: folders[index % folders.length]!,
  modified: new Date(Date.UTC(2026, 9, 28 - (index % 20), 9 + (index % 8))).toISOString().slice(0, 10),
}));

const format = useFormat();
const currentWindow = useCurrentWindow();
const folder = computed({
  get: () => currentWindow.params.value.folder ?? 'All',
  set: (value: string) => currentWindow.setParams(value === 'All' ? {} : { folder: value }),
});
const selectedName = ref<string | null>(null);

const folderOptions = [{ value: 'All', label: 'All' }, ...folders.map((value) => ({ value, label: value }))];
const visibleFiles = computed(() => (folder.value === 'All' ? files : files.filter((file) => file.folder === folder.value)));
const selected = computed(() => files.find((file) => file.name === selectedName.value) ?? null);

const columns: GridColumn<FileRow>[] = [
  { key: 'name', label: 'Name', width: 'minmax(180px, 1.6fr)' },
  { key: 'kind', label: 'Kind', width: 'minmax(120px, 1fr)' },
  { key: 'folder', label: 'Folder', width: '120px' },
  { key: 'modified', label: 'Modified', width: '110px', isNumeric: true },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'size', label: 'Size', width: '100px', align: 'end', isNumeric: true, format: (value) => `${format.number(Number(value) / 1024, { maximumFractionDigits: 0 })} KB` },
];

function statusMeta(status: FileRow['status']) {
  return statuses.find((candidate) => candidate.value === status) ?? statuses[0];
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex h-11 shrink-0 items-center gap-3 border-b border-hairline bg-chrome px-3">
      <XboSegmentedControl v-model="folder" label="Folder" :options="folderOptions" />
      <span class="xbo-figures ml-auto text-caption text-ink-muted">{{ visibleFiles.length }} files</span>
    </div>
    <div class="flex min-h-0 flex-1">
      <div class="min-w-0 flex-1">
        <XboDataGrid v-model:selected="selectedName" :rows="visibleFiles" :columns="columns" row-key="name" label="Files">
          <template #cell-status="{ row }">
            <XboStatusBadge :tone="statusMeta(row.status).tone" :label="statusMeta(row.status).label" />
          </template>
        </XboDataGrid>
      </div>
      <aside v-if="selected" class="w-[260px] shrink-0 border-l border-hairline bg-window p-4" aria-label="File details">
        <h3 class="text-title font-semibold text-ink">{{ selected.name }}</h3>
        <dl class="mt-3 grid grid-cols-[72px_1fr] gap-x-3 gap-y-1.5 text-body">
          <dt class="text-ink-muted">Kind</dt><dd>{{ selected.kind }}</dd>
          <dt class="text-ink-muted">Folder</dt><dd>{{ selected.folder }}</dd>
          <dt class="text-ink-muted">Modified</dt><dd class="xbo-figures">{{ selected.modified }}</dd>
        </dl>
      </aside>
    </div>
  </div>
</template>
