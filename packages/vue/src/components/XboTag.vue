<script setup lang="ts">
import type { StatusTone } from './status';
import { RiCloseLine } from '../icons';

withDefaults(
  defineProps<{
    tone?: StatusTone;
    label: string;
    isRemovable?: boolean;
  }>(),
  { tone: 'neutral', isRemovable: false },
);

const emit = defineEmits<{
  remove: [];
}>();
</script>

<template>
  <span class="tag" :class="`tone-${tone}`">
    {{ label }}
    <button v-if="isRemovable" type="button" class="remove" :aria-label="`Remove ${label}`" @click="emit('remove')">
      <RiCloseLine width="12" height="12" aria-hidden="true" />
    </button>
  </span>
</template>

<style scoped>
.tag {
  display: inline-flex;
  height: 22px;
  align-items: center;
  gap: 4px;
  border-radius: 999px;
  padding: 0 9px;
  font-size: calc(12px * var(--xbo-text-scale));
  font-weight: 500;
  white-space: nowrap;
}

.tone-neutral {
  background: var(--xbo-chrome);
  box-shadow: inset 0 0 0 1px var(--xbo-hairline);
  color: var(--xbo-ink);
}

.tone-info {
  background: var(--xbo-primary-soft);
  color: var(--xbo-primary);
}

.tone-success {
  background: var(--xbo-success-soft);
  color: var(--xbo-success);
}

.tone-warning {
  background: var(--xbo-warning-soft);
  color: var(--xbo-warning);
}

.tone-danger {
  background: var(--xbo-danger-soft);
  color: var(--xbo-danger);
}

.remove {
  display: grid;
  width: 16px;
  height: 16px;
  margin-right: -5px;
  place-items: center;
  border-radius: 999px;
  color: inherit;
}

.remove:hover {
  background: rgb(var(--xbo-shade) / 0.12);
}
</style>
