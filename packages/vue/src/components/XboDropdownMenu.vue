<script setup lang="ts">
import { DropdownMenuContent, DropdownMenuPortal, DropdownMenuRoot, DropdownMenuTrigger } from 'reka-ui';
import { useXbo } from '../composables';
import type { MenuEntry } from '../config';
import DropdownMenuEntries from './DropdownMenuEntries.vue';

withDefaults(
  defineProps<{
    items: MenuEntry[];
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
  }>(),
  { align: 'start', side: 'bottom' },
);

const xbo = useXbo();
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuPortal :to="xbo.ui.portalTarget ?? 'body'">
      <DropdownMenuContent class="xbo-menu-panel" :align="align" :side="side" :side-offset="4">
        <DropdownMenuEntries :entries="items" />
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
