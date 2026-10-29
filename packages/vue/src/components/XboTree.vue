<script setup lang="ts">
import type { Component } from 'vue';
import { TreeItem, TreeRoot } from 'reka-ui';
import { RiArrowRightSLine } from '../icons';

export interface TreeNode {
  id: string;
  icon?: Component;
  label: string;
  children?: TreeNode[];
}

const selected = defineModel<TreeNode | undefined>('selected');
const expanded = defineModel<string[]>('expanded', { default: () => [] });

defineProps<{
  label: string;
  nodes: TreeNode[];
}>();
</script>

<template>
  <TreeRoot
    v-slot="{ flattenItems }"
    v-model="selected"
    v-model:expanded="expanded"
    class="tree"
    :items="nodes"
    :get-key="(node: TreeNode) => node.id"
    :get-children="(node: TreeNode) => node.children"
    :aria-label="label"
  >
    <TreeItem
      v-for="item in flattenItems"
      :key="item._id"
      v-slot="{ isExpanded }"
      v-bind="item.bind"
      class="tree-item"
      :style="{ paddingLeft: `${(item.level - 1) * 16 + 6}px` }"
    >
      <RiArrowRightSLine v-if="item.hasChildren" width="14" height="14" class="chevron" :class="{ 'is-open': isExpanded }" aria-hidden="true" />
      <span v-else class="xb:w-[14px]" aria-hidden="true" />
      <component :is="item.value.icon" v-if="item.value.icon" width="15" height="15" class="xb:text-ink-muted" aria-hidden="true" />
      <span class="xb:truncate">{{ item.value.label }}</span>
    </TreeItem>
  </TreeRoot>
</template>

<style scoped>
.tree {
  display: flex;
  flex-direction: column;
  padding: 4px;
  list-style: none;
}

.tree-item {
  display: flex;
  height: var(--xbo-row-height);
  align-items: center;
  gap: 4px;
  border-radius: var(--xbo-radius-sm);
  padding-right: 8px;
  color: var(--xbo-ink);
  font-size: calc(13px * var(--xbo-text-scale));
  outline: none;
  cursor: default;
}

.tree-item:hover {
  background: var(--xbo-hover);
}

.tree-item[data-selected] {
  background: var(--xbo-primary-soft);
}

.tree-item:focus-visible {
  outline: 2px solid var(--xbo-focus);
  outline-offset: -2px;
}

.chevron {
  color: var(--xbo-ink-muted);
  transition: transform 140ms var(--xbo-ease-out);
}

.chevron.is-open {
  transform: rotate(90deg);
}
</style>
