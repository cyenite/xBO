<script setup lang="ts" generic="T extends string">
import { useId } from 'vue';
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from 'reka-ui';

const model = defineModel<T>();

withDefaults(
  defineProps<{
    label: string;
    options: readonly { value: T; label: string; hint?: string; isDisabled?: boolean }[];
    orientation?: 'vertical' | 'horizontal';
    isDisabled?: boolean;
  }>(),
  { orientation: 'vertical', isDisabled: false },
);

const groupId = useId();
</script>

<template>
  <RadioGroupRoot v-model="model" class="radio-group" :class="`is-${orientation}`" :aria-label="label" :orientation="orientation" :disabled="isDisabled">
    <div v-for="option in options" :key="option.value" class="radio-option">
      <RadioGroupItem :id="`${groupId}-${option.value}`" :value="option.value" :disabled="option.isDisabled" class="radio">
        <RadioGroupIndicator class="radio-dot" />
      </RadioGroupItem>
      <label :for="`${groupId}-${option.value}`" class="xb:flex xb:flex-col">
        <span class="xb:text-body xb:text-ink">{{ option.label }}</span>
        <span v-if="option.hint" class="xb:text-caption xb:text-ink-muted">{{ option.hint }}</span>
      </label>
    </div>
  </RadioGroupRoot>
</template>

<style scoped>
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-group.is-horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
}

.radio-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.radio {
  display: grid;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 1px;
  place-items: center;
  border-radius: 999px;
  background: var(--xbo-window);
  box-shadow: inset 0 0 0 1px var(--xbo-field-border);
}

.radio[data-state='checked'] {
  background: var(--xbo-primary);
  box-shadow: none;
}

.radio[data-disabled] {
  opacity: 0.55;
}

.radio-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--xbo-on-primary);
}
</style>
