<script setup lang="ts">
import { computed } from 'vue';
import { MenubarContent, MenubarMenu, MenubarPortal, MenubarRoot, MenubarTrigger } from 'reka-ui';
import { appearanceOptions, densityOptions, windowChromeOptions } from '@xbo-ui/core';
import { useXbo } from '../composables';
import { builtInAppIds, type MenuDefinition, type MenuEntry } from '../config';
import { RiMoonLine, RiNotification3Line, RiSunLine } from '../icons';
import MenuBarClock from './MenuBarClock.vue';
import MenubarEntries from './MenubarEntries.vue';
import XboMark from './XboMark.vue';

const xbo = useXbo();
const separator: MenuEntry = { kind: 'separator' };

const focused = computed(() => xbo.focusedWindow.value);
const focusedApp = computed(() => (focused.value ? xbo.findApp(focused.value.appId) : undefined));
const brandMark = computed(() => xbo.brand.mark ?? XboMark);

function onFocused(run: (windowId: string) => void): () => void {
  return () => {
    if (focused.value) run(focused.value.id);
  };
}

const brandMenu = computed<MenuEntry[]>(() => [
  { label: xbo.t('menu.about', { name: xbo.brand.name }), run: () => xbo.openWindow(builtInAppIds.about) },
  separator,
  { label: xbo.t('menu.settings'), shortcut: 'settings', run: () => xbo.openSettings() },
  { label: xbo.t('menu.palette'), shortcut: 'palette', run: () => void (xbo.ui.isPaletteOpen = true) },
  separator,
  { label: xbo.t('menu.showDesktop'), run: () => xbo.windows.minimizeAll() },
]);

const appMenu = computed<MenuEntry[]>(() => {
  const app = focusedApp.value;
  const current = focused.value;

  if (!app || !current) return [{ label: xbo.t('menu.openApp'), shortcut: 'palette', run: () => void (xbo.ui.isPaletteOpen = true) }];

  return [
    ...(app.isSingleInstance ? [] : [{ label: xbo.t('menu.newWindow', { app: app.label.toLowerCase() }), shortcut: 'newWindow', run: () => void xbo.openWindow(app.id, { isNewWindow: true }) }]),
    { label: xbo.t('menu.minimize'), shortcut: 'minimize', run: () => xbo.windows.minimize(current.id) },
    { label: xbo.t('menu.close', { title: current.title }), shortcut: 'close', run: () => void xbo.requestClose(current.id) },
  ];
});

const goMenu = computed<MenuEntry[]>(() => {
  const sections = xbo.appSections.value;

  return sections.flatMap((section, index) => [
    ...(index > 0 ? [separator] : []),
    ...(sections.length > 1 ? [{ kind: 'label' as const, label: section.label }] : []),
    ...section.apps.map((app) => ({ icon: app.icon ?? undefined, label: app.label, run: () => void xbo.openWindow(app.id) })),
  ]);
});

const viewMenu = computed<MenuEntry[]>(() => [
  { kind: 'label', label: xbo.t('menu.appearance') },
  ...appearanceOptions.map((option) => ({
    label: option.label,
    isChecked: xbo.preferences.appearance === option.value,
    isDisabled: xbo.lockedKeys.has('appearance'),
    run: () => void xbo.setPreference('appearance', option.value),
  })),
  separator,
  { kind: 'label', label: xbo.t('menu.density') },
  ...densityOptions.map((option) => ({
    label: option.label,
    isChecked: xbo.preferences.density === option.value,
    isDisabled: xbo.lockedKeys.has('density'),
    run: () => void xbo.setPreference('density', option.value),
  })),
  separator,
  { kind: 'label', label: xbo.t('menu.windowControls') },
  ...windowChromeOptions.map((option) => ({
    label: option.label,
    isChecked: xbo.preferences.windowChrome === option.value,
    isDisabled: xbo.lockedKeys.has('windowChrome'),
    run: () => void xbo.setPreference('windowChrome', option.value),
  })),
  separator,
  { label: xbo.t('menu.settings'), shortcut: 'settings', run: () => xbo.openSettings('appearance') },
]);

const windowMenu = computed<MenuEntry[]>(() => {
  const isExpanded = focused.value?.mode === 'maximized' || !!focused.value?.snap;
  const openWindows = xbo.windows.state.windows;

  return [
    { label: xbo.t('menu.snapLeft'), shortcut: 'snapLeft', isDisabled: !focused.value, run: onFocused((windowId) => xbo.windows.snap(windowId, 'left')) },
    { label: xbo.t('menu.snapRight'), shortcut: 'snapRight', isDisabled: !focused.value, run: onFocused((windowId) => xbo.windows.snap(windowId, 'right')) },
    { label: xbo.t(isExpanded ? 'menu.restore' : 'menu.fillScreen'), shortcut: 'maximize', isDisabled: !focused.value, run: onFocused((windowId) => xbo.windows.toggleMaximize(windowId)) },
    { label: xbo.t('menu.minimize'), shortcut: 'minimize', isDisabled: !focused.value, run: onFocused((windowId) => xbo.windows.minimize(windowId)) },
    { label: xbo.t('menu.switchWindows'), shortcut: 'switchWindow', isDisabled: openWindows.length < 2, run: () => xbo.windows.cycleFocus() },
    ...(openWindows.length > 0 ? [separator] : []),
    ...openWindows.map((openWindow) => ({
      label: openWindow.title,
      isChecked: openWindow.id === focused.value?.id,
      run: () => xbo.windows.focus(openWindow.id),
    })),
  ];
});

const helpMenu = computed<MenuEntry[]>(() => [
  ...xbo.helpMenu,
  ...(xbo.helpMenu.length > 0 ? [separator] : []),
  { label: xbo.t('menu.keyboardShortcuts'), run: () => xbo.openSettings('keyboard') },
  { label: xbo.t('menu.palette'), shortcut: 'palette', run: () => void (xbo.ui.isPaletteOpen = true) },
  separator,
  { label: xbo.t('menu.about', { name: xbo.brand.name }), run: () => void xbo.openWindow(builtInAppIds.about) },
]);

const menus = computed<MenuDefinition[]>(() => [
  ...xbo.focusedMenus.value,
  ...xbo.menus,
  { id: 'xbo:go', label: xbo.t('menu.go'), items: goMenu.value },
  { id: 'xbo:view', label: xbo.t('menu.view'), items: viewMenu.value },
  { id: 'xbo:window', label: xbo.t('menu.window'), items: windowMenu.value },
  { id: 'xbo:help', label: xbo.t('menu.help'), items: helpMenu.value },
]);

function toggleNotifications(): void {
  xbo.ui.isNotificationCenterOpen = !xbo.ui.isNotificationCenterOpen;
}
</script>

<template>
  <header
    class="xbo-material xb:absolute xb:inset-x-0 xb:top-0 xb:flex xb:h-[30px] xb:items-center xb:justify-between xb:border-b xb:border-hairline xb:pr-2 xb:pl-1"
    :style="{ zIndex: 'var(--xbo-z-menubar)' }"
    :data-tauri-drag-region="xbo.isTauri || undefined"
  >
    <MenubarRoot class="xb:flex xb:h-full xb:min-w-0 xb:items-center xb:overflow-hidden">
      <MenubarMenu value="xbo:brand">
        <MenubarTrigger class="menubar-trigger xb:px-2.5" :aria-label="xbo.t('menu.brand', { name: xbo.brand.name })">
          <component :is="brandMark" class="xb:size-4" />
        </MenubarTrigger>
        <MenubarPortal :to="xbo.ui.portalTarget ?? 'body'">
          <MenubarContent class="xbo-menu-panel" align="start" :side-offset="3">
            <MenubarEntries :entries="brandMenu" />
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>

      <MenubarMenu value="xbo:app">
        <MenubarTrigger class="menubar-trigger xb:font-semibold">{{ focusedApp?.label ?? xbo.t('app.fallback') }}</MenubarTrigger>
        <MenubarPortal :to="xbo.ui.portalTarget ?? 'body'">
          <MenubarContent class="xbo-menu-panel" align="start" :side-offset="3">
            <MenubarEntries :entries="appMenu" />
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>

      <MenubarMenu v-for="menu in menus" :key="menu.id" :value="menu.id">
        <MenubarTrigger class="menubar-trigger">{{ menu.label }}</MenubarTrigger>
        <MenubarPortal :to="xbo.ui.portalTarget ?? 'body'">
          <MenubarContent class="xbo-menu-panel" align="start" :side-offset="3">
            <MenubarEntries :entries="menu.items" />
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </MenubarRoot>

    <div class="xb:flex xb:shrink-0 xb:items-center xb:gap-0.5">
      <component :is="item.component" v-for="item in xbo.statusItems" :key="item.id" />
      <component :is="xbo.account" v-if="xbo.account" />
      <button
        v-if="xbo.shell.hasAppearanceToggle && !xbo.lockedKeys.has('appearance')"
        type="button"
        class="status-button"
        :aria-label="xbo.t(xbo.isDark.value ? 'command.switchToLight' : 'command.switchToDark')"
        :title="xbo.t(xbo.isDark.value ? 'command.switchToLight' : 'command.switchToDark')"
        @click="xbo.setPreference('appearance', xbo.isDark.value ? 'light' : 'dark')"
      >
        <RiSunLine v-if="xbo.isDark.value" width="15" height="15" aria-hidden="true" />
        <RiMoonLine v-else width="15" height="15" aria-hidden="true" />
      </button>
      <button
        v-if="xbo.shell.hasNotifications"
        type="button"
        class="status-button xb:relative"
        :aria-label="xbo.unreadCount.value > 0 ? `${xbo.t('menu.notifications')}, ${xbo.t('notifications.unread', { count: xbo.unreadCount.value })}` : xbo.t('menu.notifications')"
        :aria-expanded="xbo.ui.isNotificationCenterOpen"
        :title="`${xbo.t('menu.notifications')} (${xbo.shortcutLabel('notifications')})`"
        @click="toggleNotifications"
      >
        <RiNotification3Line width="15" height="15" aria-hidden="true" />
        <span v-if="xbo.unreadCount.value > 0" class="unread-dot" aria-hidden="true" />
      </button>
      <MenuBarClock v-if="xbo.preferences.clock !== 'hidden'" />
    </div>
  </header>
</template>

<style scoped>
.menubar-trigger {
  display: flex;
  height: 22px;
  flex-shrink: 0;
  align-items: center;
  border-radius: var(--xbo-radius-xs);
  padding: 0 8px;
  color: var(--xbo-ink);
  font-size: calc(13px * var(--xbo-text-scale));
  white-space: nowrap;
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

.status-button {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: var(--xbo-radius-xs);
  color: var(--xbo-ink);
}

.status-button:hover,
.status-button[aria-expanded='true'] {
  background: var(--xbo-hover);
}

.unread-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--xbo-danger);
  box-shadow: 0 0 0 1.5px var(--xbo-raised);
}
</style>
