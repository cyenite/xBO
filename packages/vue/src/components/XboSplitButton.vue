<script setup lang="ts">
import type { MenuEntry } from '../config';
import { RiArrowDownSLine } from '../icons';
import XboButtonGroup from './XboButtonGroup.vue';
import XboDropdownMenu from './XboDropdownMenu.vue';

withDefaults(
  defineProps<{
    label: string;
    items: MenuEntry[];
    menuLabel: string;
    variant?: 'secondary' | 'primary';
    isDisabled?: boolean;
  }>(),
  { variant: 'secondary', isDisabled: false },
);

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <XboButtonGroup :label="label">
    <button type="button" class="xbo-button" :class="`is-${variant}`" :disabled="isDisabled" @click="emit('click')">{{ label }}</button>
    <XboDropdownMenu :items="items" align="end">
      <button type="button" class="xbo-button is-icon split-toggle" :class="`is-${variant}`" :aria-label="menuLabel" :disabled="isDisabled">
        <RiArrowDownSLine width="14" height="14" aria-hidden="true" />
      </button>
    </XboDropdownMenu>
  </XboButtonGroup>
</template>

<style scoped>
.split-toggle.is-primary {
  box-shadow: inset 1px 0 0 color-mix(in oklch, var(--xbo-on-primary) 35%, transparent);
}
</style>
