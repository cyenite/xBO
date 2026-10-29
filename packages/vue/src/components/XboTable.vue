<script setup lang="ts" generic="Row extends object">
export interface TableColumn<R> {
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
  columns: TableColumn<Row>[];
}>();

function display(column: TableColumn<Row>, row: Row): string {
  const value = row[column.key];

  return column.format ? column.format(value, row) : String(value ?? '');
}

function keyOf(row: Row): string {
  return String(row[props.rowKey]);
}
</script>

<template>
  <table class="table">
    <caption class="xb:sr-only">{{ label }}</caption>
    <thead>
      <tr>
        <th v-for="column in columns" :key="column.key" scope="col" :class="{ 'is-end': column.align === 'end' }" :style="{ width: column.width }">{{ column.label }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="keyOf(row)">
        <td v-for="column in columns" :key="column.key" :class="{ 'is-end': column.align === 'end', 'xbo-figures': column.isNumeric }">
          <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">{{ display(column, row) }}</slot>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="$slots.footer">
      <slot name="footer" />
    </tfoot>
  </table>
</template>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: calc(13px * var(--xbo-text-scale));
}

th {
  height: 28px;
  border-bottom: 1px solid var(--xbo-hairline);
  padding: 0 10px;
  color: var(--xbo-ink-muted);
  font-size: calc(11px * var(--xbo-text-scale));
  font-weight: 500;
  text-align: left;
}

td {
  height: var(--xbo-row-height);
  border-bottom: 1px solid color-mix(in oklch, var(--xbo-hairline) 70%, transparent);
  padding: 0 10px;
}

.is-end {
  text-align: right;
}

tfoot :deep(td) {
  border-bottom: 0;
  font-weight: 600;
}
</style>
