<script setup lang="ts">
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
    <DropdownMenuSeparator v-if="entry.kind === 'separator'" class="xbo-menu-separator" />
    <DropdownMenuLabel v-else-if="entry.kind === 'label'" class="xbo-menu-label">{{ entry.label }}</DropdownMenuLabel>
    <DropdownMenuSub v-else-if="entry.kind === 'submenu'">
      <DropdownMenuSubTrigger class="xbo-menu-item">
        <component :is="entry.icon" v-if="entry.icon" width="14" height="14" class="xbo-menu-icon" aria-hidden="true" />
        <span class="xb:min-w-0 xb:flex-1 xb:truncate">{{ entry.label }}</span>
        <RiArrowRightSLine width="14" height="14" aria-hidden="true" />
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal :to="xbo.ui.portalTarget ?? 'body'">
        <DropdownMenuSubContent class="xbo-menu-panel" :side-offset="4" :align-offset="-4">
          <DropdownMenuEntries :entries="entry.items" />
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
    <DropdownMenuCheckboxItem
      v-else-if="entry.isChecked !== undefined"
      class="xbo-menu-item"
      :model-value="entry.isChecked"
      :disabled="entry.isDisabled"
      @select="entry.run()"
    >
      <DropdownMenuItemIndicator class="xbo-menu-icon"><RiCheckLine width="14" height="14" /></DropdownMenuItemIndicator>
      <span class="xb:min-w-0 xb:flex-1 xb:truncate">{{ entry.label }}</span>
      <span v-if="entry.shortcut" class="xbo-menu-shortcut">{{ shortcutText(entry.shortcut) }}</span>
    </DropdownMenuCheckboxItem>
    <DropdownMenuItem v-else class="xbo-menu-item" :disabled="entry.isDisabled" @select="entry.run()">
      <component :is="entry.icon" v-if="entry.icon" width="14" height="14" class="xbo-menu-icon" aria-hidden="true" />
      <span class="xb:min-w-0 xb:flex-1 xb:truncate">{{ entry.label }}</span>
      <span v-if="entry.shortcut" class="xbo-menu-shortcut">{{ shortcutText(entry.shortcut) }}</span>
    </DropdownMenuItem>
  </template>
</template>
