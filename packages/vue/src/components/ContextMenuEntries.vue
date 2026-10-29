<script setup lang="ts">
import {
  ContextMenuCheckboxItem,
  ContextMenuItem,
  ContextMenuItemIndicator,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from 'reka-ui';
import { formatBinding } from '@xbo-ui/core';
import { useXbo } from '../composables';
import type { MenuEntry } from '../config';
import { RiArrowRightSLine, RiCheckLine } from '../icons';

defineProps<{
  entries: MenuEntry[];
}>();

const xbo = useXbo();

function shortcutText(shortcut: string): string {
  return xbo.shortcutDefinitions.has(shortcut) ? xbo.shortcutLabel(shortcut) : formatBinding(shortcut, xbo.os);
}
</script>

<template>
  <template v-for="(entry, index) in entries" :key="index">
    <ContextMenuSeparator v-if="entry.kind === 'separator'" class="xbo-menu-separator" />
    <ContextMenuLabel v-else-if="entry.kind === 'label'" class="xbo-menu-label">{{ entry.label }}</ContextMenuLabel>
    <ContextMenuSub v-else-if="entry.kind === 'submenu'">
      <ContextMenuSubTrigger class="xbo-menu-item">
        <component :is="entry.icon" v-if="entry.icon" width="14" height="14" class="xbo-menu-icon" aria-hidden="true" />
        <span class="xb:min-w-0 xb:flex-1 xb:truncate">{{ entry.label }}</span>
        <RiArrowRightSLine width="14" height="14" aria-hidden="true" />
      </ContextMenuSubTrigger>
      <ContextMenuPortal :to="xbo.ui.portalTarget ?? 'body'">
        <ContextMenuSubContent class="xbo-menu-panel" :side-offset="4" :align-offset="-4">
          <ContextMenuEntries :entries="entry.items" />
        </ContextMenuSubContent>
      </ContextMenuPortal>
    </ContextMenuSub>
    <ContextMenuCheckboxItem
      v-else-if="entry.isChecked !== undefined"
      class="xbo-menu-item"
      :model-value="entry.isChecked"
      :disabled="entry.isDisabled"
      @select="entry.run()"
    >
      <ContextMenuItemIndicator class="xbo-menu-icon"><RiCheckLine width="14" height="14" /></ContextMenuItemIndicator>
      <span class="xb:min-w-0 xb:flex-1 xb:truncate">{{ entry.label }}</span>
      <span v-if="entry.shortcut" class="xbo-menu-shortcut">{{ shortcutText(entry.shortcut) }}</span>
    </ContextMenuCheckboxItem>
    <ContextMenuItem v-else class="xbo-menu-item" :disabled="entry.isDisabled" @select="entry.run()">
      <component :is="entry.icon" v-if="entry.icon" width="14" height="14" class="xbo-menu-icon" aria-hidden="true" />
      <span class="xb:min-w-0 xb:flex-1 xb:truncate">{{ entry.label }}</span>
      <span v-if="entry.shortcut" class="xbo-menu-shortcut">{{ shortcutText(entry.shortcut) }}</span>
    </ContextMenuItem>
  </template>
</template>
