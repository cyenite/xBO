<script setup lang="ts">
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui';

withDefaults(
  defineProps<{
    label: string;
    direction?: 'horizontal' | 'vertical';
    autoSaveId?: string;
    startSize?: number;
    startMinSize?: number;
    endMinSize?: number;
  }>(),
  { direction: 'horizontal', autoSaveId: undefined, startSize: 30, startMinSize: 15, endMinSize: 30 },
);
</script>

<template>
  <SplitterGroup class="split-view" :direction="direction" :auto-save-id="autoSaveId">
    <SplitterPanel :default-size="startSize" :min-size="startMinSize" class="xb:min-h-0 xb:min-w-0">
      <slot name="start" />
    </SplitterPanel>
    <SplitterResizeHandle class="handle" :class="`is-${direction}`" :aria-label="label" />
    <SplitterPanel :default-size="100 - startSize" :min-size="endMinSize" class="xb:min-h-0 xb:min-w-0">
      <slot name="end" />
    </SplitterPanel>
  </SplitterGroup>
</template>

<style scoped>
.split-view {
  height: 100%;
}

.handle {
  position: relative;
  flex-shrink: 0;
  background: var(--xbo-hairline);
  outline: none;
}

.handle.is-horizontal {
  width: 1px;
  cursor: col-resize;
}

.handle.is-vertical {
  height: 1px;
  cursor: row-resize;
}

.handle::after {
  content: '';
  position: absolute;
  inset: -3px;
}

.handle[data-state='drag'],
.handle:hover,
.handle:focus-visible {
  background: var(--xbo-primary);
}
</style>
