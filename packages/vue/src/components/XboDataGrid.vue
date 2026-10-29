<script setup lang="ts" generic="Row extends object">
import { computed, nextTick, ref, shallowRef, watch } from 'vue';
import { useElementSize, useScroll } from '@vueuse/core';
import { hasPrimaryModifier } from '@xbo-ui/core';
import { useXbo } from '../composables';
import type { MenuEntry } from '../config';
import { RiArrowDownSLine, RiArrowUpSLine } from '../icons';
import XboContextMenu from './XboContextMenu.vue';

export interface GridColumn<R> {
  key: keyof R & string;
  label: string;
  align?: 'start' | 'end';
  width?: string;
  minWidth?: number;
  isNumeric?: boolean;
  isEditable?: boolean;
  isHideable?: boolean;
  isSortable?: boolean;
  format?: (value: R[keyof R], row: R) => string;
}

export interface GridEdit<R> {
  row: R;
  key: keyof R & string;
  value: string;
}

const selected = defineModel<string | null>('selected', { default: null });
const selection = defineModel<string[]>('selection', { default: () => [] });
const hiddenColumns = defineModel<string[]>('hiddenColumns', { default: () => [] });
const columnOrder = defineModel<string[]>('columnOrder', { default: () => [] });

const props = withDefaults(
  defineProps<{
    rows: Row[];
    label: string;
    rowKey: keyof Row & string;
    columns: GridColumn<Row>[];
    isLoading?: boolean;
    isVirtual?: boolean | null;
    selectionMode?: 'none' | 'single' | 'multiple';
  }>(),
  { isLoading: false, isVirtual: null, selectionMode: 'single' },
);

const emit = defineEmits<{
  activate: [row: Row];
  edit: [edit: GridEdit<Row>];
}>();

const overscan = 8;
const virtualThreshold = 200;

const xbo = useXbo();
const body = ref<HTMLElement | null>(null);
const editInput = ref<HTMLInputElement | null>(null);
const sortKey = shallowRef<(keyof Row & string) | null>(null);
const sortDirection = ref<'ascending' | 'descending'>('ascending');
const activeKey = ref<string | null>(null);
const anchorKey = ref<string | null>(null);
const resizedWidths = ref<Record<string, number>>({});
const draggedKey = ref<string | null>(null);
const editing = shallowRef<{ rowKey: string; columnKey: keyof Row & string } | null>(null);
const editDraft = ref('');

const { y: scrollTop } = useScroll(body);
const { height: viewportHeight } = useElementSize(body);

const rowHeight = computed(() => (xbo.preferences.density === 'comfortable' ? 34 : 28));
const orderedColumns = computed(() => {
  const order = columnOrder.value;

  if (order.length === 0) return props.columns;

  return [...props.columns].sort((a, b) => (order.indexOf(a.key) + 1 || Infinity) - (order.indexOf(b.key) + 1 || Infinity));
});
const visibleColumns = computed(() => orderedColumns.value.filter((column) => !hiddenColumns.value.includes(column.key)));
const templateColumns = computed(() =>
  visibleColumns.value.map((column) => (resizedWidths.value[column.key] ? `${resizedWidths.value[column.key]}px` : (column.width ?? 'minmax(96px, 1fr)'))).join(' '),
);

const sortedRows = computed(() => {
  const key: keyof Row | null = sortKey.value;

  if (!key) return props.rows;

  const direction = sortDirection.value === 'ascending' ? 1 : -1;

  return ([...props.rows] as Row[]).sort((a: Row, b: Row) => {
    const left = a[key];
    const right = b[key];

    if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction;

    return String(left ?? '').localeCompare(String(right ?? ''), undefined, { numeric: true }) * direction;
  });
});

const isVirtualOn = computed(() => props.isVirtual ?? sortedRows.value.length > virtualThreshold);
const windowStart = computed(() => (isVirtualOn.value ? Math.max(0, Math.floor(scrollTop.value / rowHeight.value) - overscan) : 0));
const windowEnd = computed(() =>
  isVirtualOn.value ? Math.min(sortedRows.value.length, Math.ceil((scrollTop.value + viewportHeight.value) / rowHeight.value) + overscan) : sortedRows.value.length,
);
const renderedRows = computed(() => sortedRows.value.slice(windowStart.value, windowEnd.value));
const selectedKeys = computed(() => new Set(props.selectionMode === 'multiple' ? selection.value : selected.value ? [selected.value] : []));

watch(
  () => props.rows,
  () => {
    if (editing.value && !props.rows.some((row) => keyOf(row) === editing.value?.rowKey)) editing.value = null;
  },
);

function keyOf(row: Row): string {
  return String(row[props.rowKey]);
}

function display(column: GridColumn<Row>, row: Row): string {
  const value = row[column.key];

  return column.format ? column.format(value, row) : String(value ?? '');
}

function toggleSort(column: GridColumn<Row>): void {
  if (column.isSortable === false) return;

  if (sortKey.value === column.key) sortDirection.value = sortDirection.value === 'ascending' ? 'descending' : 'ascending';
  else {
    sortKey.value = column.key;
    sortDirection.value = 'ascending';
  }
}

function keysBetween(fromKey: string, toKey: string): string[] {
  const keys = sortedRows.value.map(keyOf);
  const from = keys.indexOf(fromKey);
  const to = keys.indexOf(toKey);

  return from < 0 || to < 0 ? [toKey] : keys.slice(Math.min(from, to), Math.max(from, to) + 1);
}

function selectKey(key: string, mode: 'replace' | 'toggle' | 'range' = 'replace'): void {
  activeKey.value = key;

  if (props.selectionMode === 'none') return;
  if (props.selectionMode === 'single') {
    selected.value = key;

    return;
  }

  if (mode === 'toggle') selection.value = selection.value.includes(key) ? selection.value.filter((candidate) => candidate !== key) : [...selection.value, key];
  else if (mode === 'range' && anchorKey.value) selection.value = keysBetween(anchorKey.value, key);
  else selection.value = [key];

  if (mode !== 'range') anchorKey.value = key;
}

function onRowClick(row: Row, event: MouseEvent): void {
  const isToggle = hasPrimaryModifier(event, xbo.os);

  selectKey(keyOf(row), event.shiftKey ? 'range' : isToggle ? 'toggle' : 'replace');
}

function scrollToKey(key: string): void {
  const index = sortedRows.value.findIndex((row) => keyOf(row) === key);
  const element = body.value;

  if (index < 0 || !element) return;

  const top = (index + 1) * rowHeight.value;

  if (top - rowHeight.value < element.scrollTop + rowHeight.value) element.scrollTop = Math.max(0, top - 2 * rowHeight.value);
  else if (top > element.scrollTop + element.clientHeight) element.scrollTop = top - element.clientHeight;
}

async function copySelection(): Promise<void> {
  const keys = selectedKeys.value.size > 0 ? selectedKeys.value : new Set(activeKey.value ? [activeKey.value] : []);
  const rows = sortedRows.value.filter((row) => keys.has(keyOf(row)));

  if (rows.length === 0) return;

  const header = visibleColumns.value.map((column) => column.label).join('\t');
  const lines = rows.map((row) => visibleColumns.value.map((column) => display(column, row).replace(/[\t\n]/g, ' ')).join('\t'));

  await globalThis.navigator?.clipboard?.writeText([header, ...lines].join('\n'));
}

async function startEditing(row: Row, column?: GridColumn<Row>): Promise<void> {
  const target = column ?? visibleColumns.value.find((candidate) => candidate.isEditable);

  if (!target?.isEditable) return;

  editing.value = { rowKey: keyOf(row), columnKey: target.key };
  editDraft.value = String(row[target.key] ?? '');
  await nextTick();
  editInput.value?.select();
}

function commitEdit(): void {
  const current = editing.value;
  const row = current ? props.rows.find((candidate) => keyOf(candidate) === current.rowKey) : undefined;

  editing.value = null;

  if (current && row && String(row[current.columnKey] ?? '') !== editDraft.value) emit('edit', { row, key: current.columnKey, value: editDraft.value });

  body.value?.focus();
}

function cancelEdit(): void {
  editing.value = null;
  body.value?.focus();
}

function onEditKeydown(event: KeyboardEvent): void {
  event.stopPropagation();

  if (event.key === 'Enter') commitEdit();
  else if (event.key === 'Escape') cancelEdit();
}

function onKeydown(event: KeyboardEvent): void {
  const rows = sortedRows.value;
  const index = rows.findIndex((row) => keyOf(row) === activeKey.value);
  const current = rows[index];
  const pageSize = Math.max(1, Math.floor(viewportHeight.value / rowHeight.value) - 1);
  const moves: Record<string, number> = {
    ArrowDown: index + 1,
    ArrowUp: index - 1,
    PageDown: index + pageSize,
    PageUp: index - pageSize,
    Home: 0,
    End: rows.length - 1,
  };

  if (hasPrimaryModifier(event, xbo.os) && event.key.toLowerCase() === 'c') {
    event.preventDefault();
    void copySelection();

    return;
  }

  if (hasPrimaryModifier(event, xbo.os) && event.key.toLowerCase() === 'a' && props.selectionMode === 'multiple') {
    event.preventDefault();
    selection.value = rows.map(keyOf);

    return;
  }

  if (event.key === 'Enter' && current) {
    event.preventDefault();
    emit('activate', current);

    return;
  }

  if (event.key === 'F2' && current) {
    event.preventDefault();
    void startEditing(current);

    return;
  }

  if (event.key === ' ' && current && props.selectionMode === 'multiple') {
    event.preventDefault();
    selectKey(keyOf(current), 'toggle');

    return;
  }

  if (!(event.key in moves) || rows.length === 0) return;

  event.preventDefault();

  const next = rows[Math.max(0, Math.min(rows.length - 1, moves[event.key]!))];

  if (!next) return;

  selectKey(keyOf(next), event.shiftKey && props.selectionMode === 'multiple' ? 'range' : 'replace');
  scrollToKey(keyOf(next));
}

function startResize(event: PointerEvent, column: GridColumn<Row>): void {
  const handle = event.currentTarget as HTMLElement;
  const cell = handle.parentElement;

  if (!cell) return;

  event.preventDefault();
  event.stopPropagation();
  handle.setPointerCapture(event.pointerId);

  const startX = event.clientX;
  const startWidth = cell.getBoundingClientRect().width;

  function onMove(moveEvent: PointerEvent): void {
    resizedWidths.value = { ...resizedWidths.value, [column.key]: Math.max(column.minWidth ?? 48, Math.round(startWidth + moveEvent.clientX - startX)) };
  }

  function onEnd(): void {
    handle.removeEventListener('pointermove', onMove);
    handle.removeEventListener('pointerup', onEnd);
  }

  handle.addEventListener('pointermove', onMove);
  handle.addEventListener('pointerup', onEnd);
}

function onHeaderDrop(target: GridColumn<Row>): void {
  const source = draggedKey.value;

  draggedKey.value = null;

  if (!source || source === target.key) return;

  const keys = orderedColumns.value.map((column) => column.key as string).filter((key) => key !== source);

  keys.splice(keys.indexOf(target.key), 0, source);
  columnOrder.value = keys;
}

const columnMenu = computed<MenuEntry[]>(() => [
  ...orderedColumns.value.map((column) => ({
    label: column.label,
    isChecked: !hiddenColumns.value.includes(column.key),
    isDisabled: column.isHideable === false || (visibleColumns.value.length === 1 && !hiddenColumns.value.includes(column.key)),
    run: () =>
      (hiddenColumns.value = hiddenColumns.value.includes(column.key) ? hiddenColumns.value.filter((key) => key !== column.key) : [...hiddenColumns.value, column.key]),
  })),
  { kind: 'separator' },
  {
    label: 'Reset columns',
    isDisabled: hiddenColumns.value.length === 0 && columnOrder.value.length === 0 && Object.keys(resizedWidths.value).length === 0,
    run: () => {
      hiddenColumns.value = [];
      columnOrder.value = [];
      resizedWidths.value = {};
    },
  },
]);
</script>

<template>
  <div
    ref="body"
    class="data-grid xb:h-full xb:min-h-0 xb:overflow-auto"
    role="grid"
    :aria-label="label"
    :aria-rowcount="rows.length + 1"
    :aria-colcount="visibleColumns.length"
    :aria-multiselectable="selectionMode === 'multiple' || undefined"
    :aria-busy="isLoading || undefined"
    tabindex="0"
    @keydown="onKeydown"
  >
    <XboContextMenu :items="columnMenu">
      <div class="grid-row grid-header" role="row" aria-rowindex="1" :style="{ gridTemplateColumns: templateColumns }">
        <div
          v-for="column in visibleColumns"
          :key="column.key"
          role="columnheader"
          :aria-sort="sortKey === column.key ? sortDirection : 'none'"
          class="grid-cell"
          :class="{ 'is-end': column.align === 'end', 'is-drop-target': draggedKey && draggedKey !== column.key }"
          draggable="true"
          @dragstart="draggedKey = column.key"
          @dragend="draggedKey = null"
          @dragover.prevent
          @drop="onHeaderDrop(column)"
        >
          <button type="button" tabindex="-1" class="header-button" :class="{ 'xb:justify-end': column.align === 'end' }" @click="toggleSort(column)">
            <span class="xb:truncate">{{ column.label }}</span>
            <RiArrowUpSLine v-if="sortKey === column.key && sortDirection === 'ascending'" width="13" height="13" aria-hidden="true" />
            <RiArrowDownSLine v-else-if="sortKey === column.key" width="13" height="13" aria-hidden="true" />
          </button>
          <span class="resize-handle" aria-hidden="true" @pointerdown="startResize($event, column)" @click.stop @dblclick.stop="resizedWidths = { ...resizedWidths, [column.key]: 0 }" />
        </div>
      </div>
    </XboContextMenu>

    <div v-if="isLoading" role="rowgroup">
      <div v-for="placeholder in 8" :key="placeholder" class="grid-row grid-body-row" role="row" :style="{ gridTemplateColumns: templateColumns }">
        <div v-for="column in visibleColumns" :key="column.key" role="gridcell" class="grid-cell"><span class="loading-bar" /></div>
      </div>
    </div>

    <div v-else role="rowgroup">
      <div v-if="windowStart > 0" :style="{ height: `${windowStart * rowHeight}px` }" aria-hidden="true" />
      <div
        v-for="(row, offset) in renderedRows"
        :key="keyOf(row)"
        role="row"
        :aria-rowindex="windowStart + offset + 2"
        :data-row-key="keyOf(row)"
        :aria-selected="selectionMode === 'none' ? undefined : selectedKeys.has(keyOf(row))"
        class="grid-row grid-body-row"
        :class="{ 'is-selected': selectedKeys.has(keyOf(row)), 'is-active': activeKey === keyOf(row) }"
        :style="{ gridTemplateColumns: templateColumns }"
        @click="onRowClick(row, $event)"
        @dblclick="emit('activate', row)"
      >
        <div
          v-for="column in visibleColumns"
          :key="column.key"
          role="gridcell"
          class="grid-cell"
          :class="{ 'is-end': column.align === 'end', 'xbo-figures': column.isNumeric, 'is-editable': column.isEditable }"
          @dblclick.stop="column.isEditable ? startEditing(row, column) : emit('activate', row)"
        >
          <input
            v-if="editing && editing.rowKey === keyOf(row) && editing.columnKey === column.key"
            :ref="(element) => (editInput = element as HTMLInputElement | null)"
            v-model="editDraft"
            class="cell-editor"
            :class="{ 'is-end': column.align === 'end' }"
            :aria-label="column.label"
            @keydown="onEditKeydown"
            @blur="commitEdit"
            @click.stop
          />
          <slot v-else :name="`cell-${column.key}`" :row="row" :value="row[column.key]">{{ display(column, row) }}</slot>
        </div>
      </div>
      <div v-if="windowEnd < sortedRows.length" :style="{ height: `${(sortedRows.length - windowEnd) * rowHeight}px` }" aria-hidden="true" />

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
  font-size: calc(11px * var(--xbo-text-scale));
  font-weight: 500;
}

.header-button {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 4px;
}

.grid-header .grid-cell.is-drop-target:hover {
  box-shadow: inset 2px 0 0 var(--xbo-primary);
}

.resize-handle {
  position: absolute;
  top: 4px;
  right: 0;
  bottom: 4px;
  width: 7px;
  cursor: col-resize;
  touch-action: none;
}

.resize-handle::after {
  content: '';
  position: absolute;
  top: 0;
  right: 3px;
  bottom: 0;
  width: 1px;
  background: var(--xbo-hairline);
}

.resize-handle:hover::after {
  background: var(--xbo-primary);
}

.grid-body-row {
  height: var(--xbo-row-height);
  border-bottom: 1px solid color-mix(in oklch, var(--xbo-hairline) 70%, transparent);
  cursor: default;
}

.grid-body-row:hover {
  background: var(--xbo-hover);
}

.grid-body-row.is-selected {
  background: var(--xbo-primary-soft);
}

.data-grid:focus-visible .grid-body-row.is-active {
  box-shadow: inset 0 0 0 1px var(--xbo-focus);
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

.cell-editor {
  width: 100%;
  height: calc(var(--xbo-row-height) - 6px);
  border-radius: var(--xbo-radius-xs);
  padding: 0 6px;
  background: var(--xbo-window);
  box-shadow: inset 0 0 0 1px var(--xbo-primary);
  color: var(--xbo-ink);
  font: inherit;
  outline: none;
}

.cell-editor.is-end {
  text-align: right;
}

.loading-bar {
  display: block;
  width: 70%;
  height: 10px;
  border-radius: var(--xbo-radius-xs);
  background: var(--xbo-pressed);
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
</style>
