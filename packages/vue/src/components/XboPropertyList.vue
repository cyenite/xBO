<script setup lang="ts">
withDefaults(
  defineProps<{
    items?: { label: string; value: string; isNumeric?: boolean }[];
    labelWidth?: string;
  }>(),
  { items: () => [], labelWidth: '96px' },
);
</script>

<template>
  <dl class="property-list" :style="{ gridTemplateColumns: `${labelWidth} minmax(0, 1fr)` }">
    <template v-for="item in items" :key="item.label">
      <dt>{{ item.label }}</dt>
      <dd class="xbo-selectable" :class="{ 'xbo-figures': item.isNumeric }">{{ item.value }}</dd>
    </template>
    <slot />
  </dl>
</template>

<style scoped>
.property-list {
  display: grid;
  gap: 6px 12px;
  font-size: calc(13px * var(--xbo-text-scale));
}

.property-list :deep(dt) {
  color: var(--xbo-ink-muted);
}

.property-list :deep(dd) {
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--xbo-ink);
}
</style>
