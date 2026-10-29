<script setup lang="ts">
import { computed } from 'vue';
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui';

const model = defineModel<number>({ default: 0 });

withDefaults(
  defineProps<{
    min?: number;
    max?: number;
    step?: number;
    label: string;
    isDisabled?: boolean;
  }>(),
  { min: 0, max: 100, step: 1, isDisabled: false },
);

const values = computed({
  get: () => [model.value],
  set: (next: number[] | undefined) => {
    if (next?.[0] !== undefined) model.value = next[0];
  },
});
</script>

<template>
  <SliderRoot v-model="values" class="slider" :min="min" :max="max" :step="step" :disabled="isDisabled">
    <SliderTrack class="track">
      <SliderRange class="range" />
    </SliderTrack>
    <SliderThumb class="thumb" :aria-label="label" />
  </SliderRoot>
</template>

<style scoped>
.slider {
  position: relative;
  display: flex;
  width: 100%;
  min-width: 120px;
  height: 20px;
  align-items: center;
  touch-action: none;
}

.slider[data-disabled] {
  opacity: 0.55;
}

.track {
  position: relative;
  height: 4px;
  flex: 1;
  border-radius: 999px;
  background: var(--xbo-pressed);
}

.range {
  position: absolute;
  height: 100%;
  border-radius: 999px;
  background: var(--xbo-primary);
}

.thumb {
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: oklch(1 0 0);
  box-shadow: 0 0 0 1px var(--xbo-field-border), 0 1px 3px rgb(var(--xbo-shade) / 0.25);
}
</style>
