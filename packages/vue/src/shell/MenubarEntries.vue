<script setup lang="ts">
import {
  MenubarCheckboxItem,
  MenubarItem,
  MenubarItemIndicator,
  MenubarLabel,
  MenubarPortal,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from 'reka-ui';
import { formatBinding } from '@xbo-ui/core';
import { useXbo } from '../composables';
import type { MenuEntry } from '../config';
import { RiArrowRightSLine, RiCheckLine } from '../icons';

defineProps<{
  entries: MenuEntry[];
}>();

const xbo = useXbo();

// A menu entry names either a registered shortcut id (so it follows rebinding) or a literal binding.
function shortcutText(shortcut: string): string {
  return xbo.shortcutDefinitions.has(shortcut) ? xbo.shortcutLabel(shortcut) : formatBinding(shortcut, xbo.os);
}
</script>

<template>
  <template v-for="(entry, index) in entries" :key="index">
    <MenubarSeparator v-if="entry.kind === 'separator'" class="xbo-menu-separator" />
    <MenubarLabel v-else-if="entry.kind === 'label'" class="xbo-menu-label">{{ entry.label }}</MenubarLabel>
    <MenubarSub v-else-if="entry.kind === 'submenu'">
      <MenubarSubTrigger class="xbo-menu-item">
        <component :is="entry.icon" v-if="entry.icon" width="14" height="14" class="xbo-menu-icon" aria-hidden="true" />
        <span class="xb:min-w-0 xb:flex-1 xb:truncate">{{ entry.label }}</span>
        <RiArrowRightSLine width="14" height="14" aria-hidden="true" />
      </MenubarSubTrigger>
      <MenubarPortal :to="xbo.ui.portalTarget ?? 'body'">
        <MenubarSubContent class="xbo-menu-panel" :side-offset="4" :align-offset="-4">
          <MenubarEntries :entries="entry.items" />
        </MenubarSubContent>
      </MenubarPortal>
    </MenubarSub>
    <MenubarCheckboxItem
      v-else-if="entry.isChecked !== undefined"
      class="xbo-menu-item"
      :model-value="entry.isChecked"
      :disabled="entry.isDisabled"
      @select="entry.run()"
    >
      <MenubarItemIndicator class="xbo-menu-icon"><RiCheckLine width="14" height="14" /></MenubarItemIndicator>
      <span class="xb:min-w-0 xb:flex-1 xb:truncate">{{ entry.label }}</span>
      <span v-if="entry.shortcut" class="xbo-menu-shortcut">{{ shortcutText(entry.shortcut) }}</span>
    </MenubarCheckboxItem>
    <MenubarItem v-else class="xbo-menu-item" :disabled="entry.isDisabled" @select="entry.run()">
      <component :is="entry.icon" v-if="entry.icon" width="14" height="14" class="xbo-menu-icon" aria-hidden="true" />
      <span class="xb:min-w-0 xb:flex-1 xb:truncate">{{ entry.label }}</span>
      <span v-if="entry.shortcut" class="xbo-menu-shortcut">{{ shortcutText(entry.shortcut) }}</span>
    </MenubarItem>
  </template>
</template>
