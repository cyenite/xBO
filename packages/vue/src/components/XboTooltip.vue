<script setup lang="ts">
import { TooltipContent, TooltipPortal, TooltipProvider, TooltipRoot, TooltipTrigger } from 'reka-ui';
import { useXbo } from '../composables';

withDefaults(
  defineProps<{
    text: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    delay?: number;
  }>(),
  { side: 'top', delay: 500 },
);

const xbo = useXbo();
</script>

<template>
  <TooltipProvider :delay-duration="delay">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipPortal :to="xbo.ui.portalTarget ?? 'body'">
        <TooltipContent class="tooltip" :side="side" :side-offset="6">{{ text }}</TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<style scoped>
.tooltip {
  z-index: var(--xbo-z-tooltip);
  max-width: 280px;
  border-radius: var(--xbo-radius-sm);
  padding: 4px 8px;
  background: var(--xbo-raised);
  box-shadow: var(--xbo-shadow-popover);
  color: var(--xbo-ink);
  font-size: calc(12px * var(--xbo-text-scale));
  animation: xbo-menu-in 120ms var(--xbo-ease-out);
}
</style>
