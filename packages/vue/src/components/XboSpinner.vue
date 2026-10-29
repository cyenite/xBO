<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number;
    label?: string;
  }>(),
  { size: 16, label: undefined },
);
</script>

<template>
  <svg class="spinner" :width="size" :height="size" viewBox="0 0 24 24" :role="label ? 'status' : undefined" :aria-label="label" :aria-hidden="label ? undefined : 'true'">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="3" opacity="0.2" />
    <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.spinner {
  animation: xbo-spin 800ms linear infinite;
}

@keyframes xbo-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
