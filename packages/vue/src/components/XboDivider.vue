<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
    orientation?: 'horizontal' | 'vertical';
  }>(),
  { label: '', orientation: 'horizontal' },
);
</script>

<template>
  <div class="divider" :class="`is-${orientation}`" role="separator" :aria-orientation="orientation">
    <span v-if="label && orientation === 'horizontal'" class="xb:px-2 xb:text-caption xb:text-ink-muted">{{ label }}</span>
  </div>
</template>

<style scoped>
.divider.is-horizontal {
  display: flex;
  align-items: center;
}

.divider.is-horizontal::before,
.divider.is-horizontal::after {
  content: '';
  height: 1px;
  flex: 1;
  background: var(--xbo-hairline);
}

.divider.is-vertical {
  width: 1px;
  align-self: stretch;
  background: var(--xbo-hairline);
}
</style>
