<script setup lang="ts" generic="Item extends { id: string; label: string; detail?: string; icon?: Component; isDisabled?: boolean }">
import { computed, ref, useId, type Component } from 'vue';

const selected = defineModel<string | null>('selected', { default: null });

const props = defineProps<{
  items: Item[];
  label: string;
}>();

const emit = defineEmits<{
  activate: [item: Item];
}>();

const baseId = useId();
const list = ref<HTMLElement | null>(null);

const enabledItems = computed(() => props.items.filter((item) => !item.isDisabled));

function select(item: Item): void {
  if (!item.isDisabled) selected.value = item.id;
}

function onKeydown(event: KeyboardEvent): void {
  const index = enabledItems.value.findIndex((item) => item.id === selected.value);
  const moves: Record<string, number> = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: enabledItems.value.length - 1 };

  if (event.key === 'Enter') {
    const current = enabledItems.value[index];

    if (current) emit('activate', current);

    return;
  }

  if (!(event.key in moves)) return;

  event.preventDefault();

  const next = enabledItems.value[Math.max(0, Math.min(enabledItems.value.length - 1, moves[event.key]!))];

  if (!next) return;

  select(next);
  list.value?.querySelector(`[data-id="${CSS.escape(next.id)}"]`)?.scrollIntoView({ block: 'nearest' });
}
</script>

<template>
  <ul
    ref="list"
    class="list"
    role="listbox"
    tabindex="0"
    :aria-label="label"
    :aria-activedescendant="selected ? `${baseId}-${selected}` : undefined"
    @keydown="onKeydown"
  >
    <li
      v-for="item in items"
      :id="`${baseId}-${item.id}`"
      :key="item.id"
      :data-id="item.id"
      role="option"
      class="list-item"
      :class="{ 'is-selected': item.id === selected }"
      :aria-selected="item.id === selected"
      :aria-disabled="item.isDisabled || undefined"
      @click="select(item)"
      @dblclick="emit('activate', item)"
    >
      <slot :item="item" :is-selected="item.id === selected">
        <component :is="item.icon" v-if="item.icon" width="16" height="16" class="xb:shrink-0 xb:text-ink-muted" aria-hidden="true" />
        <span class="xb:flex xb:min-w-0 xb:flex-col">
          <span class="xb:truncate xb:text-body xb:text-ink">{{ item.label }}</span>
          <span v-if="item.detail" class="xb:truncate xb:text-caption xb:text-ink-muted">{{ item.detail }}</span>
        </span>
      </slot>
    </li>
  </ul>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 4px;
}

.list:focus-visible {
  outline-offset: -2px;
}

.list-item {
  display: flex;
  min-height: var(--xbo-row-height);
  align-items: center;
  gap: 10px;
  border-radius: var(--xbo-radius-sm);
  padding: 4px 8px;
  cursor: default;
}

.list-item:hover {
  background: var(--xbo-hover);
}

.list-item.is-selected {
  background: var(--xbo-primary-soft);
}

.list-item[aria-disabled='true'] {
  opacity: 0.5;
}
</style>
