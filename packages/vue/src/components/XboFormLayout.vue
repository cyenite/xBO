<script setup lang="ts">
withDefaults(
  defineProps<{
    columns?: 1 | 2 | 3;
  }>(),
  { columns: 1 },
);
</script>

<template>
  <div class="form-layout" :style="{ '--form-columns': columns }">
    <slot />
  </div>
</template>

<style scoped>
.form-layout {
  display: grid;
  grid-template-columns: repeat(var(--form-columns), minmax(0, 1fr));
  gap: 14px 16px;
  container-type: inline-size;
}

@container (max-width: 480px) {
  .form-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

.form-layout > :deep(.is-wide) {
  grid-column: 1 / -1;
}
</style>
