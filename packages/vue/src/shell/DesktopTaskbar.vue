<script setup lang="ts">
import { computed, ref } from 'vue';
import XboContextMenu from '../components/XboContextMenu.vue';
import { useXbo } from '../composables';
import type { AppDefinition, MenuEntry } from '../config';
import { RiAppsLine, RiSearchLine } from '../icons';
import XboMark from './XboMark.vue';

const xbo = useXbo();
const isRevealed = ref(false);

const position = computed(() => xbo.preferences.taskbarPosition);
const isVertical = computed(() => position.value !== 'bottom');
const isAutoHidden = computed(() => xbo.preferences.isTaskbarAutoHidden && !isRevealed.value && !xbo.ui.isLauncherOpen);
const brandMark = computed(() => xbo.brand.mark ?? XboMark);
const taskbarApps = computed(() => {
  const pinned = xbo.pinnedAppIds.value.map((appId) => xbo.findApp(appId)).filter((app): app is AppDefinition => !!app);
  const running = [...xbo.runningAppIds.value].filter((appId) => !pinned.some((app) => app.id === appId)).map((appId) => xbo.findApp(appId));

  return [...pinned, ...running.filter((app): app is AppDefinition => !!app)];
});

function stateFor(appId: string): 'focused' | 'running' | 'idle' {
  if (xbo.focusedWindow.value?.appId === appId) return 'focused';

  return xbo.runningAppIds.value.has(appId) ? 'running' : 'idle';
}

function tooltipFor(app: AppDefinition): string {
  const count = xbo.windows.windowsForApp(app.id).length;

  return count > 1 ? `${app.label} (${xbo.t('taskbar.windowCount', { count })})` : app.label;
}

function menuFor(app: AppDefinition): MenuEntry[] {
  const appWindows = xbo.windows.windowsForApp(app.id);
  const isPinned = xbo.pinnedAppIds.value.includes(app.id);

  return [
    ...appWindows.map((appWindow) => ({ label: appWindow.title, isChecked: appWindow.id === xbo.focusedWindow.value?.id, run: () => xbo.windows.focus(appWindow.id) })),
    ...(appWindows.length > 0 ? [{ kind: 'separator' as const }] : []),
    ...(app.isSingleInstance && appWindows.length > 0 ? [] : [{ label: xbo.t('taskbar.newWindow'), run: () => void xbo.openWindow(app.id, { isNewWindow: true }) }]),
    {
      label: xbo.t(isPinned ? 'taskbar.unpin' : 'taskbar.pin'),
      isDisabled: xbo.lockedKeys.has('pinnedAppIds'),
      run: () => xbo.togglePin(app.id),
    },
    ...(appWindows.length > 0 ? [{ label: xbo.t('taskbar.closeAll'), run: () => void xbo.requestCloseApp(app.id) }] : []),
  ];
}

function toggleLauncher(): void {
  xbo.ui.isPaletteOpen = false;
  xbo.ui.isLauncherOpen = !xbo.ui.isLauncherOpen;
}

function openPalette(): void {
  xbo.ui.isLauncherOpen = false;
  xbo.ui.isPaletteOpen = true;
}
</script>

<template>
  <div
    v-if="xbo.preferences.isTaskbarAutoHidden"
    class="reveal-edge"
    :class="`is-${position}`"
    aria-hidden="true"
    @pointerenter="isRevealed = true"
  />
  <nav
    class="taskbar xbo-material xb:absolute xb:flex xb:items-center xb:gap-1 xb:rounded-xl xb:p-1.5 xb:shadow-taskbar"
    :class="[`is-${position}`, `is-${xbo.preferences.taskbarAlignment}`, { 'is-vertical': isVertical, 'is-hidden': isAutoHidden }]"
    :style="{ zIndex: 'var(--xbo-z-taskbar)' }"
    :aria-label="xbo.t('taskbar.label')"
    @pointerenter="isRevealed = true"
    @pointerleave="isRevealed = false"
    @focusin="isRevealed = true"
    @focusout="isRevealed = false"
  >
    <button
      v-if="xbo.shell.hasLauncher"
      type="button"
      class="taskbar-button"
      :class="{ 'is-pressed': xbo.ui.isLauncherOpen }"
      :aria-expanded="xbo.ui.isLauncherOpen"
      :aria-label="xbo.t('taskbar.start')"
      :data-tooltip="`${xbo.t('taskbar.start')} (${xbo.shortcutLabel('launcher')})`"
      @click="toggleLauncher"
    >
      <component :is="brandMark" class="xb:size-[26px]" />
    </button>
    <button
      v-if="xbo.shell.hasPalette"
      type="button"
      class="taskbar-button"
      :aria-label="xbo.t('taskbar.search')"
      :data-tooltip="`${xbo.t('taskbar.search')} (${xbo.shortcutLabel('palette')})`"
      @click="openPalette"
    >
      <RiSearchLine width="20" height="20" class="xb:text-ink" aria-hidden="true" />
    </button>

    <span class="divider" aria-hidden="true"></span>

    <XboContextMenu v-for="app in taskbarApps" :key="app.id" :items="menuFor(app)">
      <button
        type="button"
        class="taskbar-button"
        :class="`is-${stateFor(app.id)}`"
        :aria-label="app.label"
        :aria-pressed="stateFor(app.id) === 'focused'"
        :data-tooltip="tooltipFor(app)"
        @click="xbo.windows.activateApp(app.id)"
      >
        <span class="xb:grid xb:size-[30px] xb:place-items-center xb:rounded-md xb:bg-window xb:ring-1 xb:ring-hairline">
          <component :is="app.icon ?? RiAppsLine" width="18" height="18" class="xb:text-primary" aria-hidden="true" />
        </span>
        <span class="running-indicator" aria-hidden="true"></span>
      </button>
    </XboContextMenu>
  </nav>
</template>

<style scoped>
.taskbar {
  transition:
    transform 220ms var(--xbo-ease-out),
    opacity 220ms linear;
}

.taskbar.is-bottom {
  bottom: 8px;
  height: 52px;
}

.taskbar.is-bottom.is-center {
  left: 50%;
  translate: -50% 0;
}

.taskbar.is-bottom.is-start {
  left: 8px;
}

.taskbar.is-vertical {
  top: 38px;
  width: 52px;
  max-height: calc(100% - 46px);
  flex-direction: column;
}

.taskbar.is-vertical.is-center {
  top: 50%;
  translate: 0 -50%;
}

.taskbar.is-left {
  left: 8px;
}

.taskbar.is-right {
  right: 8px;
}

.taskbar.is-hidden.is-bottom {
  transform: translateY(calc(100% + 12px));
}

.taskbar.is-hidden.is-left {
  transform: translateX(calc(-100% - 12px));
}

.taskbar.is-hidden.is-right {
  transform: translateX(calc(100% + 12px));
}

.reveal-edge {
  position: absolute;
  z-index: var(--xbo-z-taskbar);
}

.reveal-edge.is-bottom {
  right: 0;
  bottom: 0;
  left: 0;
  height: 6px;
}

.reveal-edge.is-left,
.reveal-edge.is-right {
  top: 30px;
  bottom: 0;
  width: 6px;
}

.reveal-edge.is-left {
  left: 0;
}

.reveal-edge.is-right {
  right: 0;
}

.divider {
  width: 1px;
  height: 24px;
  margin: 0 4px;
  background: var(--xbo-hairline);
}

.is-vertical .divider {
  width: 24px;
  height: 1px;
  margin: 4px 0;
}

.taskbar-button {
  position: relative;
  display: grid;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  place-items: center;
  border-radius: var(--xbo-radius-md);
  transition: background-color 120ms linear;
}

.taskbar-button:hover,
.taskbar-button.is-pressed,
.taskbar-button.is-focused,
.taskbar-button[data-state='open'] {
  background: var(--xbo-hover);
}

.taskbar-button > :first-child {
  transition: transform 160ms var(--xbo-ease-out);
}

.taskbar-button:active > :first-child {
  transform: scale(0.92);
}

.running-indicator {
  position: absolute;
  bottom: 2px;
  left: 50%;
  width: 0;
  height: 3px;
  border-radius: 999px;
  background: var(--xbo-ink-subtle);
  transform: translateX(-50%);
  transition:
    width 200ms var(--xbo-ease-out),
    background-color 200ms linear;
}

.is-vertical .running-indicator {
  top: 50%;
  bottom: auto;
  left: 2px;
  width: 3px;
  height: 0;
  transform: translateY(-50%);
  transition:
    height 200ms var(--xbo-ease-out),
    background-color 200ms linear;
}

.is-right .running-indicator {
  right: 2px;
  left: auto;
}

.is-running .running-indicator {
  width: 6px;
}

.is-focused .running-indicator {
  width: 16px;
  background: var(--xbo-primary);
}

.is-vertical .is-running .running-indicator {
  width: 3px;
  height: 6px;
}

.is-vertical .is-focused .running-indicator {
  width: 3px;
  height: 16px;
}

.taskbar-button[data-tooltip]:hover::after,
.taskbar-button[data-tooltip]:focus-visible::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  z-index: var(--xbo-z-tooltip);
  padding: 4px 8px;
  border-radius: var(--xbo-radius-sm);
  background: var(--xbo-raised);
  box-shadow: var(--xbo-shadow-popover);
  color: var(--xbo-ink);
  font-size: calc(12px * var(--xbo-text-scale));
  white-space: nowrap;
  transform: translateX(-50%);
  pointer-events: none;
}

.is-left .taskbar-button[data-tooltip]:hover::after,
.is-left .taskbar-button[data-tooltip]:focus-visible::after {
  top: 50%;
  bottom: auto;
  left: calc(100% + 10px);
  transform: translateY(-50%);
}

.is-right .taskbar-button[data-tooltip]:hover::after,
.is-right .taskbar-button[data-tooltip]:focus-visible::after {
  top: 50%;
  right: calc(100% + 10px);
  bottom: auto;
  left: auto;
  transform: translateY(-50%);
}

.taskbar-button[data-state='open']::after {
  display: none;
}
</style>
