<script setup lang="ts">
import { ProgressIndicator, ProgressRoot } from 'reka-ui';

withDefaults(
  defineProps<{
    max?: number;
    label: string;
    value?: number | null;
  }>(),
  { max: 100, value: null },
);
</script>

<template>
  <ProgressRoot class="progress" :model-value="value" :max="max" :aria-label="label">
    <ProgressIndicator class="indicator" :class="{ 'is-indeterminate': value === null }" :style="value === null ? undefined : { transform: `translateX(-${100 - (value / max) * 100}%)` }" />
  </ProgressRoot>
</template>

<style scoped>
.progress {
  position: relative;
  width: 100%;
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--xbo-pressed);
}

.indicator {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: var(--xbo-primary);
  transition: transform 240ms var(--xbo-ease-out);
}

.indicator.is-indeterminate {
  width: 40%;
  animation: indeterminate 1.2s var(--xbo-ease-out) infinite;
}

@keyframes indeterminate {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(250%);
  }
}
</style>
