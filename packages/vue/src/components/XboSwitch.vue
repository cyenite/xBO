<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui';

const model = defineModel<boolean>({ required: true });

withDefaults(
  defineProps<{
    label: string;
    isDisabled?: boolean;
  }>(),
  { isDisabled: false },
);
</script>

<template>
  <SwitchRoot v-model="model" class="switch" :aria-label="label" :disabled="isDisabled">
    <SwitchThumb class="switch-thumb" />
  </SwitchRoot>
</template>

<style scoped>
.switch {
  position: relative;
  display: inline-flex;
  width: 34px;
  height: 20px;
  flex-shrink: 0;
  align-items: center;
  border-radius: 999px;
  padding: 2px;
  background: var(--xbo-pressed);
  box-shadow: inset 0 0 0 1px var(--xbo-field-border);
  transition: background-color 140ms linear;
}

.switch[data-state='checked'] {
  background: var(--xbo-primary);
  box-shadow: none;
}

.switch[data-disabled] {
  opacity: 0.55;
}

.switch-thumb {
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: oklch(1 0 0);
  box-shadow: 0 1px 2px rgb(var(--xbo-shade) / 0.3);
  transition: transform 160ms var(--xbo-ease-out);
}

.switch-thumb[data-state='checked'] {
  transform: translateX(14px);
}
</style>
