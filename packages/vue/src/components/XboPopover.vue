<script setup lang="ts">
import { PopoverArrow, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui';
import { useXbo } from '../composables';

const isOpen = defineModel<boolean>('open', { default: false });

withDefaults(
  defineProps<{
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    width?: string;
  }>(),
  { side: 'bottom', align: 'center', width: 'auto' },
);

const xbo = useXbo();
</script>

<template>
  <PopoverRoot v-model:open="isOpen">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverPortal :to="xbo.ui.portalTarget ?? 'body'">
      <PopoverContent class="xbo-popover-panel xb:p-3" :side="side" :align="align" :side-offset="6" :style="{ width }">
        <slot />
        <PopoverArrow class="arrow" :width="12" :height="6" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped>
.arrow {
  fill: var(--xbo-raised);
}
</style>
