<script setup lang="ts" generic="T extends string">
import { computed, ref } from 'vue';
import { ComboboxAnchor, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxPortal, ComboboxRoot, ComboboxTrigger, ComboboxViewport } from 'reka-ui';
import { rankSearchables } from '@xbo-ui/core';
import { useXbo } from '../composables';
import { RiArrowDownSLine, RiCheckLine } from '../icons';
import { useFormFieldControl } from './formField';

const model = defineModel<T>();

const props = withDefaults(
  defineProps<{
    id?: string;
    label?: string;
    options: readonly { value: T; label: string; keywords?: string[]; isDisabled?: boolean }[];
    emptyText?: string;
    placeholder?: string;
    isDisabled?: boolean;
  }>(),
  { id: undefined, label: undefined, emptyText: 'No matches', placeholder: '', isDisabled: false },
);

const xbo = useXbo();
const query = ref('');
const control = useFormFieldControl(props.id);

const filtered = computed(() => rankSearchables(props.options, query.value));

function labelFor(value: T | undefined): string {
  return props.options.find((option) => option.value === value)?.label ?? '';
}
</script>

<template>
  <ComboboxRoot v-model="model" :disabled="isDisabled" :ignore-filter="true">
    <ComboboxAnchor class="xbo-field" :class="{ 'is-invalid': control.isInvalid.value, 'is-disabled': isDisabled }">
      <ComboboxInput
        :id="control.inputId.value"
        v-model="query"
        class="xbo-field-input"
        :placeholder="placeholder"
        :display-value="labelFor"
        :aria-label="label"
        :aria-describedby="control.describedBy.value"
      />
      <ComboboxTrigger class="xbo-field-affix" tabindex="-1"><RiArrowDownSLine width="14" height="14" aria-hidden="true" /></ComboboxTrigger>
    </ComboboxAnchor>
    <ComboboxPortal :to="xbo.ui.portalTarget ?? 'body'">
      <ComboboxContent class="xbo-menu-panel" position="popper" :side-offset="4">
        <ComboboxViewport>
          <ComboboxEmpty class="xb:px-2 xb:py-1.5 xb:text-body xb:text-ink-muted">{{ emptyText }}</ComboboxEmpty>
          <ComboboxItem v-for="option in filtered" :key="option.value" :value="option.value" :disabled="option.isDisabled" class="xbo-menu-item">
            <ComboboxItemIndicator class="xbo-menu-icon"><RiCheckLine width="14" height="14" /></ComboboxItemIndicator>
            {{ option.label }}
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
