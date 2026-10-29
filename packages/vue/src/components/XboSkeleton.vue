<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string;
    height?: string;
    lines?: number;
  }>(),
  { width: '100%', height: '12px', lines: 1 },
);
</script>

<template>
  <span class="skeleton-stack" aria-hidden="true">
    <span v-for="line in lines" :key="line" class="skeleton" :style="{ width: line === lines && lines > 1 ? '60%' : width, height }" />
  </span>
</template>

<style scoped>
.skeleton-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton {
  display: block;
  border-radius: var(--xbo-radius-xs);
  background: linear-gradient(90deg, var(--xbo-pressed) 0%, var(--xbo-hover) 50%, var(--xbo-pressed) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}

@keyframes shimmer {
  from {
    background-position: 100% 0;
  }

  to {
    background-position: -100% 0;
  }
}
</style>
