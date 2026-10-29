<script setup lang="ts">
defineProps<{
  label: string;
}>();
</script>

<template>
  <div class="button-group" role="group" :aria-label="label">
    <slot />
  </div>
</template>

<style scoped>
.button-group {
  display: inline-flex;
}

.button-group > :deep(.xbo-button:not(:first-child)) {
  margin-left: -1px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.button-group > :deep(.xbo-button:not(:last-child)) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.button-group > :deep(.xbo-button:focus-visible) {
  position: relative;
  z-index: 1;
}
</style>
