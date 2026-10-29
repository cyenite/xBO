<script setup lang="ts">
import { computed, provide, useId } from 'vue';
import { RiErrorWarningLine } from '../icons';
import { formFieldKey } from './formField';

const props = withDefaults(
  defineProps<{
    label: string;
    hint?: string;
    error?: string;
    isRequired?: boolean;
  }>(),
  { hint: '', error: '', isRequired: false },
);

const inputId = useId();
const hintId = `${inputId}-hint`;
const errorId = `${inputId}-error`;

const isInvalid = computed(() => props.error !== '');
// Only ids of rendered elements: the hint is replaced by the error while the field is invalid.
const describedBy = computed(() => (isInvalid.value ? errorId : props.hint ? hintId : undefined));

provide(formFieldKey, { inputId, isInvalid, isRequired: computed(() => props.isRequired), describedBy });
</script>

<template>
  <div class="form-field">
    <label :for="inputId" class="xb:text-label xb:font-medium xb:text-ink-muted">
      {{ label }}<span v-if="isRequired" class="xb:text-danger" aria-hidden="true"> *</span>
    </label>
    <slot />
    <p v-if="hint && !isInvalid" :id="hintId" class="xb:text-caption xb:text-ink-muted">{{ hint }}</p>
    <p v-if="isInvalid" :id="errorId" class="xb:flex xb:items-center xb:gap-1 xb:text-caption xb:text-danger" role="alert">
      <RiErrorWarningLine width="13" height="13" aria-hidden="true" />{{ error }}
    </p>
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}
</style>
