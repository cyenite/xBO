<script setup lang="ts">
import { useFormFieldControl } from './formField';

const model = defineModel<string>({ default: '' });

const props = withDefaults(
  defineProps<{
    id?: string;
    rows?: number;
    label?: string;
    placeholder?: string;
    isDisabled?: boolean;
    isReadOnly?: boolean;
  }>(),
  { id: undefined, rows: 4, label: undefined, placeholder: '', isDisabled: false, isReadOnly: false },
);

const control = useFormFieldControl(props.id);
</script>

<template>
  <div class="xbo-field is-multiline" :class="{ 'is-invalid': control.isInvalid.value, 'is-disabled': isDisabled, 'is-read-only': isReadOnly }">
    <textarea
      :id="control.inputId.value"
      v-model="model"
      class="xbo-field-input xb:resize-y"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :readonly="isReadOnly"
      :required="control.isRequired.value"
      :aria-label="label"
      :aria-invalid="control.isInvalid.value || undefined"
      :aria-describedby="control.describedBy.value"
    />
  </div>
</template>
