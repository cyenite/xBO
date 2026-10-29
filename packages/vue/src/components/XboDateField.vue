<script setup lang="ts">
import { useFormFieldControl } from './formField';

const model = defineModel<string>({ default: '' });

const props = withDefaults(
  defineProps<{
    id?: string;
    min?: string;
    max?: string;
    kind?: 'date' | 'time' | 'datetime-local' | 'month';
    label?: string;
    isDisabled?: boolean;
    isReadOnly?: boolean;
  }>(),
  { id: undefined, min: undefined, max: undefined, kind: 'date', label: undefined, isDisabled: false, isReadOnly: false },
);

const control = useFormFieldControl(props.id);
</script>

<template>
  <div class="xbo-field" :class="{ 'is-invalid': control.isInvalid.value, 'is-disabled': isDisabled, 'is-read-only': isReadOnly }">
    <input
      :id="control.inputId.value"
      v-model="model"
      class="xbo-field-input xbo-figures date-input"
      :type="kind"
      :min="min"
      :max="max"
      :disabled="isDisabled"
      :readonly="isReadOnly"
      :aria-label="label"
      :aria-invalid="control.isInvalid.value || undefined"
      :aria-describedby="control.describedBy.value"
    />
  </div>
</template>

<style scoped>
.date-input::-webkit-calendar-picker-indicator {
  opacity: 0.6;
}

:where([data-xbo-mode='dark']) .date-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>
