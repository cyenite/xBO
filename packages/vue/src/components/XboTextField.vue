<script setup lang="ts">
import type { Component } from 'vue';
import { useFormFieldControl } from './formField';

const model = defineModel<string>({ default: '' });

const props = withDefaults(
  defineProps<{
    id?: string;
    icon?: Component;
    type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local' | 'month';
    label?: string;
    placeholder?: string;
    autocomplete?: string;
    isDisabled?: boolean;
    isReadOnly?: boolean;
  }>(),
  { id: undefined, icon: undefined, type: 'text', label: undefined, placeholder: '', autocomplete: undefined, isDisabled: false, isReadOnly: false },
);

const control = useFormFieldControl(props.id);
</script>

<template>
  <div class="xbo-field" :class="{ 'is-invalid': control.isInvalid.value, 'is-disabled': isDisabled, 'is-read-only': isReadOnly }">
    <span v-if="icon || $slots.prefix" class="xbo-field-affix">
      <slot name="prefix"><component :is="icon" width="14" height="14" aria-hidden="true" /></slot>
    </span>
    <input
      :id="control.inputId.value"
      v-model="model"
      class="xbo-field-input"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :disabled="isDisabled"
      :readonly="isReadOnly"
      :required="control.isRequired.value"
      :aria-label="label"
      :aria-invalid="control.isInvalid.value || undefined"
      :aria-describedby="control.describedBy.value"
    />
    <span v-if="$slots.suffix" class="xbo-field-affix"><slot name="suffix" /></span>
  </div>
</template>
