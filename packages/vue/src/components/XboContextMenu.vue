<script setup lang="ts">
import { ContextMenuContent, ContextMenuPortal, ContextMenuRoot, ContextMenuTrigger } from 'reka-ui';
import { useXbo } from '../composables';
import type { MenuEntry } from '../config';
import ContextMenuEntries from './ContextMenuEntries.vue';

withDefaults(
  defineProps<{
    items: MenuEntry[];
    isDisabled?: boolean;
  }>(),
  { isDisabled: false },
);

const xbo = useXbo();
</script>

<template>
  <ContextMenuRoot>
    <ContextMenuTrigger as-child :disabled="isDisabled">
      <slot />
    </ContextMenuTrigger>
    <ContextMenuPortal :to="xbo.ui.portalTarget ?? 'body'">
      <ContextMenuContent class="xbo-menu-panel">
        <ContextMenuEntries :entries="items" />
      </ContextMenuContent>
    </ContextMenuPortal>
  </ContextMenuRoot>
</template>
