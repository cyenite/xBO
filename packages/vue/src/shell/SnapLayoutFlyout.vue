<script setup lang="ts">
import type { DropTarget } from '@xbo-ui/core';
import { useXbo } from '../composables';
import type { MessageKey } from '../i18n';

defineProps<{
  top: number;
  left: number;
}>();

const emit = defineEmits<{
  pick: [zone: DropTarget];
  leave: [];
  enter: [];
}>();

interface SnapLayout {
  rows: string;
  label: MessageKey;
  columns: string;
  cells: { zone: DropTarget; area: string }[];
}

const xbo = useXbo();

const layouts: SnapLayout[] = [
  {
    rows: '1fr',
    label: 'window.layout.twoColumns',
    columns: '1fr 1fr',
    cells: [
      { zone: 'left', area: '1 / 1 / 2 / 2' },
      { zone: 'right', area: '1 / 2 / 2 / 3' },
    ],
  },
  {
    rows: '1fr 1fr',
    label: 'window.layout.leftAndQuarters',
    columns: '1fr 1fr',
    cells: [
      { zone: 'left', area: '1 / 1 / 3 / 2' },
      { zone: 'top-right', area: '1 / 2 / 2 / 3' },
      { zone: 'bottom-right', area: '2 / 2 / 3 / 3' },
    ],
  },
  {
    rows: '1fr 1fr',
    label: 'window.layout.quarters',
    columns: '1fr 1fr',
    cells: [
      { zone: 'top-left', area: '1 / 1 / 2 / 2' },
      { zone: 'top-right', area: '1 / 2 / 2 / 3' },
      { zone: 'bottom-left', area: '2 / 1 / 3 / 2' },
      { zone: 'bottom-right', area: '2 / 2 / 3 / 3' },
    ],
  },
];
</script>

<template>
  <Teleport :to="xbo.ui.portalTarget ?? 'body'">
    <div
      class="xbo-material xb:absolute xb:flex xb:gap-2 xb:rounded-lg xb:p-2 xb:shadow-popover"
      :style="{ top: `${top}px`, left: `${left}px`, zIndex: 'var(--xbo-z-dropdown)' }"
      role="menu"
      :aria-label="xbo.t('window.layouts')"
      data-no-drag
      @pointerenter="emit('enter')"
      @pointerleave="emit('leave')"
    >
      <div
        v-for="layout in layouts"
        :key="layout.label"
        class="xb:grid xb:h-[46px] xb:w-[72px] xb:gap-[3px] xb:rounded-sm xb:bg-window xb:p-[3px] xb:ring-1 xb:ring-hairline"
        :style="{ gridTemplateColumns: layout.columns, gridTemplateRows: layout.rows }"
        :aria-label="xbo.t(layout.label)"
        role="group"
      >
        <button
          v-for="cell in layout.cells"
          :key="cell.zone"
          type="button"
          role="menuitem"
          class="xb:rounded-xs xb:bg-hover xb:transition-colors xb:duration-150 xb:hover:bg-primary xb:focus-visible:bg-primary"
          :style="{ gridArea: cell.area }"
          :aria-label="xbo.t(`window.zone.${cell.zone}`)"
          :title="xbo.t(`window.zone.${cell.zone}`)"
          @click="emit('pick', cell.zone)"
        />
      </div>
    </div>
  </Teleport>
</template>
