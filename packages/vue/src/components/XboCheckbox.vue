<script setup lang="ts">
import { useId } from 'vue';
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui';
import { RiCheckLine, RiSubtractLine } from '../icons';

const model = defineModel<boolean | 'indeterminate'>({ default: false });

withDefaults(
  defineProps<{
    label?: string;
    isDisabled?: boolean;
  }>(),
  { label: undefined, isDisabled: false },
);

const id = useId();
</script>

<template>
  <span class="checkbox-row" :class="{ 'is-disabled': isDisabled }">
    <CheckboxRoot :id="id" v-model="model" class="checkbox" :disabled="isDisabled" :aria-label="$slots.default ? undefined : label">
      <CheckboxIndicator class="xb:grid xb:place-items-center">
        <RiSubtractLine v-if="model === 'indeterminate'" width="12" height="12" />
        <RiCheckLine v-else width="12" height="12" />
      </CheckboxIndicator>
    </CheckboxRoot>
    <label v-if="$slots.default || label" :for="id" class="xb:text-body xb:text-ink"><slot>{{ label }}</slot></label>
  </span>
</template>

<style scoped>
.checkbox-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.checkbox-row.is-disabled {
  opacity: 0.55;
}

.checkbox {
  display: grid;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  place-items: center;
  border-radius: var(--xbo-radius-xs);
  background: var(--xbo-window);
  box-shadow: inset 0 0 0 1px var(--xbo-field-border);
  color: var(--xbo-on-primary);
}

.checkbox[data-state='checked'],
.checkbox[data-state='indeterminate'] {
  background: var(--xbo-primary);
  box-shadow: none;
}
</style>
