<script setup lang="ts" generic="T extends string">
import { nextTick, ref } from 'vue';

const model = defineModel<T>({ required: true });

const props = withDefaults(
  defineProps<{
    label: string;
    options: readonly { value: T; label: string }[];
    isDisabled?: boolean;
  }>(),
  { isDisabled: false },
);

const buttons = ref<HTMLButtonElement[]>([]);

async function move(event: KeyboardEvent): Promise<void> {
  const index = props.options.findIndex((option) => option.value === model.value);
  const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;

  if (step === 0 || props.isDisabled) return;

  event.preventDefault();

  const nextIndex = (index + step + props.options.length) % props.options.length;
  const next = props.options[nextIndex];

  if (!next) return;

  model.value = next.value;
  await nextTick();
  buttons.value[nextIndex]?.focus();
}
</script>

<template>
  <div
    class="segmented xb:inline-flex xb:h-7 xb:max-w-full xb:overflow-x-auto xb:rounded-sm xb:bg-chrome xb:p-0.5 xb:ring-1 xb:ring-hairline"
    :class="{ 'is-disabled': isDisabled }"
    role="radiogroup"
    :aria-label="label"
    :aria-disabled="isDisabled || undefined"
    @keydown="move"
  >
    <button
      v-for="option in options"
      :key="option.value"
      ref="buttons"
      type="button"
      role="radio"
      :aria-checked="model === option.value"
      :tabindex="model === option.value ? 0 : -1"
      :disabled="isDisabled"
      class="xb:shrink-0 xb:rounded-xs xb:px-3 xb:text-body xb:whitespace-nowrap xb:transition-colors xb:duration-150"
      :class="model === option.value ? 'xb:bg-window xb:font-medium xb:text-ink xb:shadow-[0_0_0_1px_var(--xbo-hairline),0_1px_2px_rgb(var(--xbo-shade)/0.08)]' : 'xb:text-ink-muted xb:hover:text-ink'"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented.is-disabled {
  opacity: 0.6;
}
</style>
