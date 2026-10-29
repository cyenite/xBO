<script setup lang="ts">
import type { Component } from 'vue';

export interface SidebarItem {
  id: string;
  icon?: Component;
  label: string;
  count?: number;
}

export interface SidebarSection {
  id: string;
  label?: string;
  items: SidebarItem[];
}

const selected = defineModel<string | null>('selected', { default: null });

withDefaults(
  defineProps<{
    label: string;
    width?: string;
    sections: SidebarSection[];
  }>(),
  { width: '220px' },
);
</script>

<template>
  <nav class="sidebar" :style="{ width }" :aria-label="label">
    <slot name="header" />
    <div v-for="section in sections" :key="section.id" class="xb:flex xb:flex-col xb:gap-0.5" :role="section.label ? 'group' : undefined" :aria-label="section.label">
      <p v-if="section.label" class="xb:px-2 xb:pt-3 xb:pb-1 xb:text-label xb:text-ink-muted" aria-hidden="true">{{ section.label }}</p>
      <button
        v-for="item in section.items"
        :key="item.id"
        type="button"
        class="sidebar-item"
        :class="{ 'is-selected': item.id === selected }"
        :aria-current="item.id === selected ? 'page' : undefined"
        @click="selected = item.id"
      >
        <component :is="item.icon" v-if="item.icon" width="15" height="15" aria-hidden="true" />
        <span class="xb:min-w-0 xb:flex-1 xb:truncate">{{ item.label }}</span>
        <span v-if="item.count !== undefined" class="xbo-figures xb:text-caption xb:text-ink-muted">{{ item.count }}</span>
      </button>
    </div>
    <div class="xb:mt-auto">
      <slot name="footer" />
    </div>
  </nav>
</template>

<style scoped>
.sidebar {
  display: flex;
  height: 100%;
  flex-shrink: 0;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  border-right: 1px solid var(--xbo-hairline);
  padding: 8px;
  background: var(--xbo-chrome);
}

.sidebar-item {
  display: flex;
  height: 30px;
  align-items: center;
  gap: 8px;
  border-radius: var(--xbo-radius-sm);
  padding: 0 8px;
  color: var(--xbo-ink);
  font-size: calc(13px * var(--xbo-text-scale));
  text-align: left;
  transition: background-color 120ms linear;
}

.sidebar-item:hover {
  background: var(--xbo-hover);
}

.sidebar-item.is-selected {
  background: var(--xbo-primary-soft);
  color: var(--xbo-primary);
  font-weight: 500;
}
</style>
