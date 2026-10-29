<script setup lang="ts" generic="T extends string">
const model = defineModel<T>({ required: true });

defineProps<{
  label: string;
  options: readonly { value: T; label: string }[];
}>();

function move(event: KeyboardEvent, options: readonly { value: T; label: string }[]): void {
  const index = options.findIndex((option) => option.value === model.value);
  const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;

  if (step === 0) return;

  event.preventDefault();

  const next = options[(index + step + options.length) % options.length];

  if (next) model.value = next.value;
}
</script>

<template>
  <div class="inline-flex h-7 rounded-sm bg-chrome p-0.5 ring-1 ring-hairline" role="radiogroup" :aria-label="label" @keydown="move($event, options)">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="model === option.value"
      :tabindex="model === option.value ? 0 : -1"
      class="rounded-xs px-3 text-body transition-colors duration-150"
      :class="model === option.value ? 'bg-window font-medium text-ink shadow-[0_0_0_1px_var(--xbo-hairline),0_1px_2px_rgb(var(--xbo-shade)/0.08)]' : 'text-ink-muted hover:text-ink'"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
