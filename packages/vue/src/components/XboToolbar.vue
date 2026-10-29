<script setup lang="ts">
import { ToolbarRoot } from 'reka-ui';

withDefaults(
  defineProps<{
    label: string;
    orientation?: 'horizontal' | 'vertical';
  }>(),
  { orientation: 'horizontal' },
);
</script>

<template>
  <ToolbarRoot class="toolbar" :class="`is-${orientation}`" :orientation="orientation" :aria-label="label" loop>
    <slot />
  </ToolbarRoot>
</template>

<style scoped>
.toolbar {
  display: flex;
  min-height: 44px;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid var(--xbo-hairline);
  padding: 0 10px;
  background: var(--xbo-chrome);
}

.toolbar.is-vertical {
  min-height: 0;
  flex-direction: column;
  border-right: 1px solid var(--xbo-hairline);
  border-bottom: 0;
  padding: 10px 0;
}

.toolbar :deep(.xbo-toolbar-spacer) {
  flex: 1;
}
</style>
