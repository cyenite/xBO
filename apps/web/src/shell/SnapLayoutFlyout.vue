<script setup lang="ts">
import type { SnapZone } from './geometry';

defineProps<{
  top: number;
  left: number;
}>();

const emit = defineEmits<{
  pick: [zone: SnapZone | 'maximize'];
  leave: [];
  enter: [];
}>();

interface LayoutCell {
  zone: SnapZone | 'maximize';
  label: string;
  area: string;
}

const layouts: { label: string; columns: string; rows: string; cells: LayoutCell[] }[] = [
  {
    label: 'Two columns',
    columns: '1fr 1fr',
    rows: '1fr',
    cells: [
      { zone: 'left', label: 'Left half', area: '1 / 1 / 2 / 2' },
      { zone: 'right', label: 'Right half', area: '1 / 2 / 2 / 3' },
    ],
  },
  {
    label: 'Four quarters',
    columns: '1fr 1fr',
    rows: '1fr 1fr',
    cells: [
      { zone: 'top-left', label: 'Top left quarter', area: '1 / 1 / 2 / 2' },
      { zone: 'top-right', label: 'Top right quarter', area: '1 / 2 / 2 / 3' },
      { zone: 'bottom-left', label: 'Bottom left quarter', area: '2 / 1 / 3 / 2' },
      { zone: 'bottom-right', label: 'Bottom right quarter', area: '2 / 2 / 3 / 3' },
    ],
  },
  {
    label: 'Full screen',
    columns: '1fr',
    rows: '1fr',
    cells: [{ zone: 'maximize', label: 'Fill the screen', area: '1 / 1 / 2 / 2' }],
  },
];
</script>

<template>
  <Teleport to="body">
    <div
      class="material fixed flex gap-2 rounded-lg p-2 shadow-popover"
      :style="{ top: `${top}px`, left: `${left}px`, zIndex: 'var(--z-dropdown)' }"
      role="menu"
      aria-label="Snap layouts"
      data-no-drag
      @pointerenter="emit('enter')"
      @pointerleave="emit('leave')"
    >
      <div
        v-for="layout in layouts"
        :key="layout.label"
        class="grid h-[46px] w-[72px] gap-[3px] rounded-sm bg-window p-[3px] ring-1 ring-hairline"
        :style="{ gridTemplateColumns: layout.columns, gridTemplateRows: layout.rows }"
        :aria-label="layout.label"
        role="group"
      >
        <button
          v-for="cell in layout.cells"
          :key="cell.zone"
          type="button"
          role="menuitem"
          class="rounded-xs bg-hover transition-colors duration-150 hover:bg-primary focus-visible:bg-primary"
          :style="{ gridArea: cell.area }"
          :aria-label="cell.label"
          :title="cell.label"
          @click="emit('pick', cell.zone)"
        />
      </div>
    </div>
  </Teleport>
</template>
