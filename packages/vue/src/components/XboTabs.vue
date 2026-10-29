<script setup lang="ts" generic="T extends string">
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from 'reka-ui';

const model = defineModel<T>();

defineProps<{
  label: string;
  tabs: readonly { value: T; label: string; isDisabled?: boolean }[];
}>();
</script>

<template>
  <TabsRoot v-model="model" class="tabs">
    <TabsList class="tab-list" :aria-label="label">
      <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value" :disabled="tab.isDisabled" class="tab">{{ tab.label }}</TabsTrigger>
      <TabsIndicator class="indicator" />
    </TabsList>
    <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value" class="tab-panel">
      <slot :name="tab.value" />
    </TabsContent>
  </TabsRoot>
</template>

<style scoped>
.tabs {
  display: flex;
  min-height: 0;
  flex-direction: column;
}

.tab-list {
  position: relative;
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  border-bottom: 1px solid var(--xbo-hairline);
  padding: 0 8px;
}

.tab {
  height: 34px;
  padding: 0 10px;
  color: var(--xbo-ink-muted);
  font-size: calc(13px * var(--xbo-text-scale));
  font-weight: 500;
}

.tab:hover {
  color: var(--xbo-ink);
}

.tab[data-state='active'] {
  color: var(--xbo-ink);
}

.tab[data-disabled] {
  color: var(--xbo-ink-subtle);
}

.indicator {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: var(--reka-tabs-indicator-size);
  height: 2px;
  border-radius: 999px;
  background: var(--xbo-primary);
  transform: translateX(var(--reka-tabs-indicator-position));
  transition: transform 200ms var(--xbo-ease-out), width 200ms var(--xbo-ease-out);
}

.tab-panel {
  min-height: 0;
  flex: 1;
  outline: none;
}
</style>
