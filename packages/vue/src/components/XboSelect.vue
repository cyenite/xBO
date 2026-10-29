<script setup lang="ts" generic="T extends string">
import { SelectContent, SelectIcon, SelectItem, SelectItemIndicator, SelectItemText, SelectPortal, SelectRoot, SelectTrigger, SelectValue, SelectViewport } from 'reka-ui';
import { useXbo } from '../composables';
import { RiArrowDownSLine, RiCheckLine } from '../icons';
import { useFormFieldControl } from './formField';

const model = defineModel<T>();

const props = withDefaults(
  defineProps<{
    id?: string;
    label?: string;
    options: readonly { value: T; label: string; isDisabled?: boolean }[];
    placeholder?: string;
    isDisabled?: boolean;
  }>(),
  { id: undefined, label: undefined, placeholder: '', isDisabled: false },
);

const xbo = useXbo();
const control = useFormFieldControl(props.id);
</script>

<template>
  <SelectRoot v-model="model" :disabled="isDisabled">
    <SelectTrigger
      :id="control.inputId.value"
      class="xbo-field select-trigger"
      :class="{ 'is-invalid': control.isInvalid.value, 'is-disabled': isDisabled }"
      :aria-label="label"
      :aria-describedby="control.describedBy.value"
    >
      <SelectValue :placeholder="placeholder" class="xb:min-w-0 xb:flex-1 xb:truncate xb:text-left" />
      <SelectIcon class="xbo-field-affix"><RiArrowDownSLine width="14" height="14" /></SelectIcon>
    </SelectTrigger>
    <SelectPortal :to="xbo.ui.portalTarget ?? 'body'">
      <SelectContent class="xbo-menu-panel" position="popper" :side-offset="4">
        <SelectViewport>
          <SelectItem v-for="option in options" :key="option.value" :value="option.value" :disabled="option.isDisabled" class="xbo-menu-item">
            <SelectItemIndicator class="xbo-menu-icon"><RiCheckLine width="14" height="14" /></SelectItemIndicator>
            <SelectItemText>{{ option.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<style scoped>
.select-trigger {
  min-width: 140px;
  text-align: left;
}

.select-trigger[data-placeholder] :deep(span) {
  color: var(--xbo-ink-subtle);
}
</style>
