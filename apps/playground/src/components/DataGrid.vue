<script setup lang="ts" generic="Row extends object">
import { computed, ref } from 'vue';
import { RiArrowDownSLine, RiArrowUpSLine } from '../icons';

export interface GridColumn<R> {
  key: keyof R & string;
  label: string;
  align?: 'start' | 'end';
  width?: string;
  isNumeric?: boolean;
  format?: (value: R[keyof R], row: R) => string;
}

const props = defineProps<{
  rows: Row[];
  label: string;
  rowKey: keyof Row & string;
  columns: GridColumn<Row>[];
}>();

const selectedKey = defineModel<string | null>('selected', { default: null });

const emit = defineEmits<{
  activate: [row: Row];
}>();

const sortKey = ref<(keyof Row & string) | null>(null);
const sortDirection = ref<'ascending' | 'descending'>('ascending');
const body = ref<HTMLElement | null>(null);

const sortedRows = computed(() => {
  const key = sortKey.value as (keyof Row & string) | null;

  if (!key) return props.rows;

  const direction = sortDirection.value === 'ascending' ? 1 : -1;

  return [...props.rows].sort((a, b) => {
    const left = a[key];
    const right = b[key];

    if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction;

    return String(left).localeCompare(String(right), undefined, { numeric: true }) * direction;
  });
});

const templateColumns = computed(() => props.columns.map((column) => column.width ?? 'minmax(96px, 1fr)').join(' '));

function keyOf(row: Row): string {
  return String(row[props.rowKey]);
}

function display(column: GridColumn<Row>, row: Row): string {
  const value = row[column.key];

  return column.format ? column.format(value, row) : String(value ?? '');
}

function toggleSort(key: keyof Row & string): void {
  if (sortKey.value === key) sortDirection.value = sortDirection.value === 'ascending' ? 'descending' : 'ascending';
  else {
    sortKey.value = key;
    sortDirection.value = 'ascending';
  }
}

function select(row: Row): void {
  selectedKey.value = keyOf(row);
}

function onKeydown(event: KeyboardEvent): void {
  const rows = sortedRows.value;
  const index = rows.findIndex((row) => keyOf(row) === selectedKey.value);
  let next: number;

  if (event.key === 'ArrowDown') next = Math.min(rows.length - 1, index + 1);
  else if (event.key === 'ArrowUp') next = Math.max(0, index - 1);
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = rows.length - 1;
  else if (event.key === 'Enter' && rows[index]) {
    emit('activate', rows[index]);

    return;
  } else return;

  event.preventDefault();

  const row = rows[next];

  if (!row) return;

  select(row);
  body.value?.querySelector(`[data-row-key="${CSS.escape(keyOf(row))}"]`)?.scrollIntoView({ block: 'nearest' });
}
</script>

<template>
  <div
    ref="body"
    class="data-grid h-full min-h-0 overflow-auto"
    role="grid"
    :aria-label="label"
    :aria-rowcount="rows.length + 1"
    tabindex="0"
    @keydown="onKeydown"
  >
    <div class="grid-row grid-header" role="row" :style="{ gridTemplateColumns: templateColumns }">
      <div
        v-for="column in columns"
        :key="column.key"
        role="columnheader"
        :aria-sort="sortKey === column.key ? sortDirection : 'none'"
        class="grid-cell"
        :class="{ 'is-end': column.align === 'end' }"
      >
        <button type="button" tabindex="-1" class="flex w-full items-center gap-1" :class="{ 'justify-end': column.align === 'end' }" @click="toggleSort(column.key)">
          {{ column.label }}
          <RiArrowUpSLine v-if="sortKey === column.key && sortDirection === 'ascending'" width="13" height="13" aria-hidden="true" />
          <RiArrowDownSLine v-else-if="sortKey === column.key" width="13" height="13" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div role="rowgroup">
      <div
        v-for="row in sortedRows"
        :key="keyOf(row)"
        role="row"
        :data-row-key="keyOf(row)"
        :aria-selected="keyOf(row) === selectedKey"
        class="grid-row grid-body-row"
        :class="{ 'is-selected': keyOf(row) === selectedKey }"
        :style="{ gridTemplateColumns: templateColumns }"
        @click="select(row)"
        @dblclick="emit('activate', row)"
      >
        <div
          v-for="column in columns"
          :key="column.key"
          role="gridcell"
          class="grid-cell"
          :class="{ 'is-end': column.align === 'end', figures: column.isNumeric }"
        >
          <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">{{ display(column, row) }}</slot>
        </div>
      </div>

      <slot v-if="rows.length === 0" name="empty" />
    </div>
  </div>
</template>

<style scoped>
.data-grid:focus-visible {
  outline-offset: -2px;
}

.grid-row {
  display: grid;
  align-items: center;
  min-width: max-content;
}

.grid-header {
  position: sticky;
  top: 0;
  z-index: 1;
  height: 28px;
  border-bottom: 1px solid var(--xbo-hairline);
  background: var(--xbo-chrome);
  color: var(--xbo-ink-muted);
  font-size: 11px;
  font-weight: 500;
}

.grid-body-row {
  height: var(--grid-row-height, 28px);
  border-bottom: 1px solid color-mix(in oklch, var(--xbo-hairline) 70%, transparent);
  cursor: default;
}

:root[data-density='comfortable'] .grid-body-row {
  --grid-row-height: 34px;
}

.grid-body-row:hover {
  background: var(--xbo-hover);
}

.grid-body-row.is-selected {
  background: var(--xbo-primary-soft);
}

.grid-body-row.is-selected .grid-cell:first-child::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 2px;
  width: 3px;
  height: 14px;
  border-radius: 999px;
  background: var(--xbo-primary);
  transform: translateY(-50%);
}

/* Every row is its own grid, so a cell's content must not size its track or long values knock that row out of line. */
.grid-cell {
  contain: inline-size;
  position: relative;
  overflow: hidden;
  padding: 0 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grid-cell.is-end {
  text-align: right;
}
</style>
