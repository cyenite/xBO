<script setup lang="ts">
import { computed } from 'vue';
import { formatBinding } from '@xbo-ui/core';
import { useXbo } from '../composables';

const props = defineProps<{
  binding: string;
}>();

const xbo = useXbo();

const text = computed(() => (xbo.shortcutDefinitions.has(props.binding) ? xbo.shortcutLabel(props.binding) : formatBinding(props.binding, xbo.os)));
</script>

<template>
  <kbd class="kbd">{{ text }}</kbd>
</template>

<style scoped>
.kbd {
  display: inline-flex;
  height: 20px;
  align-items: center;
  border-radius: var(--xbo-radius-xs);
  padding: 0 6px;
  background: var(--xbo-chrome);
  box-shadow: inset 0 -1px 0 var(--xbo-hairline), inset 0 0 0 1px var(--xbo-hairline);
  color: var(--xbo-ink-muted);
  font-family: var(--xbo-font-sans);
  font-size: calc(11px * var(--xbo-text-scale));
  white-space: nowrap;
}
</style>
