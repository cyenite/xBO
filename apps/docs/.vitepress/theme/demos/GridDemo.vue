<script setup lang="ts">
import { ref } from 'vue';
import { XboDataGrid, XboStatusBadge, type GridColumn } from '@xbo-ui/vue';

interface Row {
  id: string;
  name: string;
  owner: string;
  status: 'Done' | 'Waiting';
  hours: number;
}

const rows = ref<Row[]>(
  Array.from({ length: 400 }, (_, index) => ({
    id: String(index + 1),
    name: `Task ${index + 1}`,
    owner: ['Ada', 'Ben', 'Cleo', 'Dan'][index % 4]!,
    status: index % 3 === 0 ? 'Waiting' : 'Done',
    hours: (index * 7) % 40,
  })),
);
const selection = ref<string[]>([]);

const columns: GridColumn<Row>[] = [
  { key: 'name', label: 'Task', width: 'minmax(160px, 1fr)', isEditable: true },
  { key: 'owner', label: 'Owner', width: '120px' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'hours', label: 'Hours', width: '90px', align: 'end', isNumeric: true },
];

function onEdit(edit: { row: Row; value: string }): void {
  edit.row.name = edit.value;
}
</script>

<template>
  <XboDataGrid v-model:selection="selection" selection-mode="multiple" :rows="rows" :columns="columns" row-key="id" label="Tasks" @edit="onEdit">
    <template #cell-status="{ row }">
      <XboStatusBadge :tone="row.status === 'Done' ? 'success' : 'warning'" :label="row.status" />
    </template>
  </XboDataGrid>
</template>
