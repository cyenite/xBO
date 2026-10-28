<script setup lang="ts">
import { computed } from 'vue';
import {
  MenubarContent,
  MenubarItem,
  MenubarItemIndicator,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarRoot,
  MenubarSeparator,
  MenubarTrigger,
} from 'reka-ui';
import { RiCheckLine, RiMoonLine, RiSunLine } from '../icons';
import { findApp, moduleGroups, appsInGroup } from '../apps/catalog';
import { chromeOptions, densityOptions, themeOptions, usePreferencesStore } from '../stores/preferences';
import { useWindowsStore } from '../stores/windows';
import ApiStatus from './ApiStatus.vue';
import MenuBarClock from './MenuBarClock.vue';
import XboMark from './XboMark.vue';
import { shortcuts } from './commands';

const emit = defineEmits<{
  openPalette: [];
}>();

const windows = useWindowsStore();
const preferences = usePreferencesStore();

const focused = computed(() => windows.focusedWindow);
const focusedApp = computed(() => (focused.value ? findApp(focused.value.appId) : undefined));
const organizationName = 'Demo Distributors Ltd';
</script>

<template>
  <header
    class="material fixed inset-x-0 top-0 flex h-[30px] items-center justify-between border-b border-hairline pr-2 pl-1"
    :style="{ zIndex: 'var(--z-menubar)' }"
  >
    <MenubarRoot class="flex h-full items-center">
      <MenubarMenu value="xbo">
        <MenubarTrigger class="menubar-trigger px-2.5" aria-label="xBO menu">
          <XboMark class="size-4" />
        </MenubarTrigger>
        <MenubarPortal>
          <MenubarContent class="menu-panel" align="start" :side-offset="3">
            <MenubarItem class="menu-item" @select="windows.open('about')">About xBO</MenubarItem>
            <MenubarSeparator class="menu-separator" />
            <MenubarItem class="menu-item" @select="windows.open('settings')">Settings…</MenubarItem>
            <MenubarItem class="menu-item" @select="emit('openPalette')">
              Command palette<span class="menu-shortcut">{{ shortcuts.palette }}</span>
            </MenubarItem>
            <MenubarSeparator class="menu-separator" />
            <MenubarItem class="menu-item" @select="windows.minimizeAll()">Show desktop</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>

      <MenubarMenu value="app">
        <MenubarTrigger class="menubar-trigger font-semibold">{{ focusedApp?.label ?? 'Desktop' }}</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent class="menu-panel" align="start" :side-offset="3">
            <template v-if="focused && focusedApp">
              <MenubarItem v-if="!focusedApp.isSingleInstance" class="menu-item" @select="windows.open(focusedApp.id, { isNewWindow: true })">
                New {{ focusedApp.label.toLowerCase() }} window
              </MenubarItem>
              <MenubarItem class="menu-item" @select="windows.minimize(focused.id)">
                Minimise<span class="menu-shortcut">{{ shortcuts.minimize }}</span>
              </MenubarItem>
              <MenubarItem class="menu-item" @select="windows.close(focused.id)">
                Close {{ focused.title }}<span class="menu-shortcut">{{ shortcuts.close }}</span>
              </MenubarItem>
            </template>
            <MenubarItem v-else class="menu-item" @select="emit('openPalette')">Open an app…</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>

      <MenubarMenu value="go">
        <MenubarTrigger class="menubar-trigger">Go</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent class="menu-panel max-h-[70vh] overflow-y-auto" align="start" :side-offset="3">
            <template v-for="(group, index) in moduleGroups" :key="group.id">
              <MenubarSeparator v-if="index > 0" class="menu-separator" />
              <MenubarLabel class="menu-label">{{ group.label }}</MenubarLabel>
              <MenubarItem v-for="app in appsInGroup(group.id)" :key="app.id" class="menu-item" @select="windows.open(app.id)">
                <component :is="app.icon" width="15" height="15" class="menu-icon" aria-hidden="true" />{{ app.label }}
              </MenubarItem>
            </template>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>

      <MenubarMenu value="view">
        <MenubarTrigger class="menubar-trigger">View</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent class="menu-panel" align="start" :side-offset="3">
            <MenubarLabel class="menu-label">Appearance</MenubarLabel>
            <MenubarRadioGroup v-model="preferences.theme">
              <MenubarRadioItem v-for="option in themeOptions" :key="option.value" :value="option.value" class="menu-item pl-7">
                <MenubarItemIndicator class="menu-check"><RiCheckLine width="14" height="14" /></MenubarItemIndicator>{{ option.label }}
              </MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarSeparator class="menu-separator" />
            <MenubarLabel class="menu-label">Density</MenubarLabel>
            <MenubarRadioGroup v-model="preferences.density">
              <MenubarRadioItem v-for="option in densityOptions" :key="option.value" :value="option.value" class="menu-item pl-7">
                <MenubarItemIndicator class="menu-check"><RiCheckLine width="14" height="14" /></MenubarItemIndicator>{{ option.label }}
              </MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarSeparator class="menu-separator" />
            <MenubarLabel class="menu-label">Window controls</MenubarLabel>
            <MenubarRadioGroup v-model="preferences.chrome">
              <MenubarRadioItem v-for="option in chromeOptions" :key="option.value" :value="option.value" class="menu-item pl-7">
                <MenubarItemIndicator class="menu-check"><RiCheckLine width="14" height="14" /></MenubarItemIndicator>{{ option.label }}
              </MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>

      <MenubarMenu value="window">
        <MenubarTrigger class="menubar-trigger">Window</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent class="menu-panel" align="start" :side-offset="3">
            <MenubarItem class="menu-item" :disabled="!focused" @select="focused && windows.snap(focused.id, 'left')">
              Snap to left half<span class="menu-shortcut">{{ shortcuts.snapLeft }}</span>
            </MenubarItem>
            <MenubarItem class="menu-item" :disabled="!focused" @select="focused && windows.snap(focused.id, 'right')">
              Snap to right half<span class="menu-shortcut">{{ shortcuts.snapRight }}</span>
            </MenubarItem>
            <MenubarItem class="menu-item" :disabled="!focused" @select="focused && windows.toggleMaximize(focused.id)">
              {{ focused?.mode === 'maximized' ? 'Restore' : 'Fill screen' }}<span class="menu-shortcut">{{ shortcuts.maximize }}</span>
            </MenubarItem>
            <MenubarItem class="menu-item" :disabled="!focused" @select="focused && windows.minimize(focused.id)">
              Minimise<span class="menu-shortcut">{{ shortcuts.minimize }}</span>
            </MenubarItem>
            <template v-if="windows.windows.length > 0">
              <MenubarSeparator class="menu-separator" />
              <MenubarItem v-for="openWindow in windows.windows" :key="openWindow.id" class="menu-item pl-7" @select="windows.focus(openWindow.id)">
                <RiCheckLine v-if="openWindow.id === focused?.id" width="14" height="14" class="menu-check" aria-label="Focused" />
                {{ openWindow.title }}
                <span v-if="openWindow.mode === 'minimized'" class="menu-shortcut">Minimised</span>
              </MenubarItem>
            </template>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>

      <MenubarMenu value="help">
        <MenubarTrigger class="menubar-trigger">Help</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent class="menu-panel" align="start" :side-offset="3">
            <MenubarItem class="menu-item" @select="emit('openPalette')">
              Search commands<span class="menu-shortcut">{{ shortcuts.palette }}</span>
            </MenubarItem>
            <MenubarItem class="menu-item" @select="windows.open('about')">About xBO</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </MenubarRoot>

    <div class="flex items-center gap-0.5">
      <span class="hidden px-2 text-caption text-ink-muted md:inline">{{ organizationName }}</span>
      <ApiStatus />
      <button
        type="button"
        class="grid size-6 place-items-center rounded-xs text-ink hover:bg-hover"
        :aria-label="preferences.isDark ? 'Switch to light appearance' : 'Switch to dark appearance'"
        @click="preferences.toggleTheme()"
      >
        <RiSunLine v-if="preferences.isDark" width="15" height="15" aria-hidden="true" />
        <RiMoonLine v-else width="15" height="15" aria-hidden="true" />
      </button>
      <MenuBarClock />
    </div>
  </header>
</template>

<style scoped>
.menubar-trigger {
  display: flex;
  height: 22px;
  align-items: center;
  border-radius: var(--radius-xs);
  padding: 0 8px;
  color: var(--xbo-ink);
  font-size: 13px;
  outline: none;
  transition: background-color 100ms linear;
}

.menubar-trigger[data-state='open'],
.menubar-trigger[data-highlighted],
.menubar-trigger:hover {
  background: var(--xbo-hover);
}

.menubar-trigger:focus-visible {
  outline: 2px solid var(--xbo-focus);
  outline-offset: -1px;
}
</style>

<style>
.menu-panel {
  z-index: var(--z-dropdown);
  min-width: 220px;
  border-radius: var(--radius-md);
  padding: 4px;
  background: color-mix(in oklch, var(--xbo-raised) calc(var(--xbo-material-alpha) * 100%), transparent);
  backdrop-filter: saturate(170%) blur(22px);
  box-shadow: var(--shadow-popover);
  color: var(--xbo-ink);
  font-size: 13px;
  transform-origin: var(--reka-menubar-content-transform-origin);
  animation: menu-in 140ms var(--ease-out-quint);
}

:root[data-transparency='reduced'] .menu-panel {
  backdrop-filter: none;
}

@keyframes menu-in {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
}

.menu-item {
  position: relative;
  display: flex;
  height: 26px;
  align-items: center;
  gap: 8px;
  border-radius: var(--radius-xs);
  padding: 0 8px;
  outline: none;
  cursor: default;
  user-select: none;
}

.menu-item[data-highlighted] {
  background: var(--xbo-primary);
  color: var(--xbo-on-primary);
}

.menu-item[data-highlighted] .menu-shortcut,
.menu-item[data-highlighted] .menu-icon {
  color: var(--xbo-on-primary);
}

.menu-item[data-disabled] {
  color: var(--xbo-ink-subtle);
}

.menu-label {
  padding: 6px 8px 2px;
  color: var(--xbo-ink-muted);
  font-size: 11px;
  font-weight: 500;
}

.menu-separator {
  height: 1px;
  margin: 4px 8px;
  background: var(--xbo-hairline);
}

.menu-shortcut {
  margin-left: auto;
  padding-left: 24px;
  color: var(--xbo-ink-subtle);
  font-size: 12px;
}

.menu-icon {
  color: var(--xbo-ink-muted);
}

.menu-check {
  position: absolute;
  left: 8px;
}
</style>
