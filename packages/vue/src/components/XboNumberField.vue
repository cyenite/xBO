<script setup lang="ts">
import { ref, watch } from 'vue';
import { RiArrowDownSLine, RiArrowUpSLine } from '../icons';
import { addDecimal, compareDecimal, isDecimalInput, normalizeDecimal } from './decimal';
import { useFormFieldControl } from './formField';

const model = defineModel<string>({ default: '' });

const props = withDefaults(
  defineProps<{
    id?: string;
    min?: string;
    max?: string;
    step?: string;
    scale?: number;
    label?: string;
    suffix?: string;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    hasStepper?: boolean;
  }>(),
  { id: undefined, min: undefined, max: undefined, step: '1', scale: 2, label: undefined, suffix: '', isDisabled: false, isReadOnly: false, hasStepper: true },
);

const control = useFormFieldControl(props.id);
const draft = ref(model.value);

watch(model, (value) => {
  if (normalizeDecimal(draft.value, props.scale) !== value) draft.value = value;
});

function clamp(value: string): string {
  if (value === '') return value;
  if (props.min !== undefined && compareDecimal(value, props.min, props.scale) < 0) return normalizeDecimal(props.min, props.scale);
  if (props.max !== undefined && compareDecimal(value, props.max, props.scale) > 0) return normalizeDecimal(props.max, props.scale);

  return value;
}

function onInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(',', '.');

  if (isDecimalInput(value)) draft.value = value;
  else input.value = draft.value;
}

function commit(): void {
  const value = clamp(normalizeDecimal(draft.value, props.scale));

  draft.value = value;
  model.value = value;
}

function stepBy(direction: 1 | -1): void {
  if (props.isDisabled || props.isReadOnly) return;

  const step = direction === 1 ? props.step : `-${props.step}`;

  draft.value = clamp(addDecimal(normalizeDecimal(draft.value, props.scale) || '0', step, props.scale));
  model.value = draft.value;
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
    stepBy(event.key === 'ArrowUp' ? 1 : -1);
  } else if (event.key === 'Enter') commit();
}
</script>

<template>
  <div class="xbo-field" :class="{ 'is-invalid': control.isInvalid.value, 'is-disabled': isDisabled, 'is-read-only': isReadOnly }">
    <input
      :id="control.inputId.value"
      :value="draft"
      class="xbo-field-input xbo-figures xb:text-right"
      type="text"
      inputmode="decimal"
      role="spinbutton"
      :aria-label="label"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="model === '' ? undefined : model"
      :aria-invalid="control.isInvalid.value || undefined"
      :aria-describedby="control.describedBy.value"
      :disabled="isDisabled"
      :readonly="isReadOnly"
      @input="onInput"
      @blur="commit"
      @keydown="onKeydown"
    />
    <span v-if="suffix" class="xbo-field-affix xb:text-caption">{{ suffix }}</span>
    <span v-if="hasStepper && !isReadOnly" class="stepper">
      <button type="button" tabindex="-1" aria-hidden="true" :disabled="isDisabled" @click="stepBy(1)"><RiArrowUpSLine width="12" height="12" /></button>
      <button type="button" tabindex="-1" aria-hidden="true" :disabled="isDisabled" @click="stepBy(-1)"><RiArrowDownSLine width="12" height="12" /></button>
    </span>
  </div>
</template>

<style scoped>
.stepper {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  margin-right: -4px;
}

.stepper button {
  display: grid;
  width: 16px;
  height: 11px;
  place-items: center;
  border-radius: 3px;
  color: var(--xbo-ink-muted);
}

.stepper button:hover:not(:disabled) {
  background: var(--xbo-hover);
  color: var(--xbo-ink);
}
</style>
