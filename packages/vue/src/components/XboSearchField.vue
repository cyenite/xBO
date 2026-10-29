<script setup lang="ts">
import { ref } from 'vue';
import { RiCloseLine, RiSearchLine } from '../icons';

const model = defineModel<string>({ default: '' });

withDefaults(
  defineProps<{
    label: string;
    placeholder?: string;
    isDisabled?: boolean;
  }>(),
  { placeholder: '', isDisabled: false },
);

const input = ref<HTMLInputElement | null>(null);

function clear(): void {
  model.value = '';
  input.value?.focus();
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && model.value !== '') {
    event.stopPropagation();
    clear();
  }
}
</script>

<template>
  <div class="xbo-field" :class="{ 'is-disabled': isDisabled }" role="search">
    <span class="xbo-field-affix"><RiSearchLine width="14" height="14" aria-hidden="true" /></span>
    <input
      ref="input"
      v-model="model"
      type="search"
      class="xbo-field-input search-input"
      :placeholder="placeholder"
      :aria-label="label"
      :disabled="isDisabled"
      @keydown="onKeydown"
    />
    <button v-if="model !== ''" type="button" class="clear" :aria-label="`Clear ${label.toLowerCase()}`" @click="clear">
      <RiCloseLine width="13" height="13" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.search-input::-webkit-search-cancel-button {
  display: none;
}

.clear {
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border-radius: 999px;
  background: var(--xbo-pressed);
  color: var(--xbo-ink-muted);
}

.clear:hover {
  color: var(--xbo-ink);
}
</style>
