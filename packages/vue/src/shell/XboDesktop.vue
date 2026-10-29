<script setup lang="ts">
import { computed, onMounted, onScopeDispose, ref, watch } from 'vue';
import { useEventListener, useResizeObserver } from '@vueuse/core';
import { useXbo } from '../composables';
import AppWindow from './AppWindow.vue';
import CommandPalette from './CommandPalette.vue';
import DesktopTaskbar from './DesktopTaskbar.vue';
import DialogHost from './DialogHost.vue';
import MenuBar from './MenuBar.vue';
import NotificationCenter from './NotificationCenter.vue';
import StartLauncher from './StartLauncher.vue';
import ToastStack from './ToastStack.vue';
import WindowSwitcher from './WindowSwitcher.vue';

const menuBarHeight = 30;
const taskbarReserve = 68;

const xbo = useXbo();
const root = ref<HTMLElement | null>(null);
const portalHost = ref<HTMLElement | null>(null);
const size = ref({ width: 0, height: 0 });

const windows = computed(() => xbo.windows.state.windows);
const dropPreview = computed(() => xbo.windows.state.dropPreview);
const isTaskbarReserved = computed(() => xbo.shell.hasTaskbar && !xbo.preferences.isTaskbarAutoHidden);
const hint = computed(() => xbo.shell.desktopHint ?? xbo.t('desktop.hint', { shortcut: xbo.shortcutLabel('palette') }));

watch(
  () => [size.value.width, size.value.height, xbo.shell.hasMenuBar, isTaskbarReserved.value, xbo.preferences.taskbarPosition] as const,
  ([width, height, hasMenuBar, isReserved, position]) => {
    if (width === 0 || height === 0) return;

    const top = hasMenuBar ? menuBarHeight : 0;
    const left = isReserved && position === 'left' ? taskbarReserve : 0;
    const right = isReserved && position === 'right' ? taskbarReserve : 0;
    const bottom = isReserved && position === 'bottom' ? taskbarReserve : 0;

    xbo.windows.setWorkspace({ x: left, y: top, width: width - left - right, height: height - top - bottom });
  },
);

const { isSupported: isResizeObserverSupported } = useResizeObserver(root, ([entry]) => {
  if (entry) size.value = { width: entry.contentRect.width, height: entry.contentRect.height };
});

let hasStarted = false;

// Windows are laid out against the workspace, so startup waits for the first real measurement; opening them against
// the placeholder size would cascade and clamp them for a desktop that does not exist.
function startOnce(): void {
  if (hasStarted) return;

  hasStarted = true;
  void xbo.start();
}

watch(size, (next) => {
  if (next.width > 0 && next.height > 0) startOnce();
});

function openSwitcher(): void {
  if (xbo.windows.state.windows.length < 2) return;

  xbo.ui.switcherIndex = xbo.ui.isSwitcherOpen ? (xbo.ui.switcherIndex + 1) % xbo.windows.byRecency().length : 1;
  xbo.ui.isSwitcherOpen = true;
}

function bindShortcut(shortcutId: string, run: (event: KeyboardEvent) => void): void {
  onScopeDispose(xbo.onShortcut(shortcutId, run));
}

function withFocused(run: (windowId: string) => void): () => void {
  return () => {
    const focused = xbo.focusedWindow.value;

    if (focused) run(focused.id);
  };
}

bindShortcut('palette', () => {
  xbo.ui.isLauncherOpen = false;
  xbo.ui.isPaletteOpen = !xbo.ui.isPaletteOpen;
});
bindShortcut('launcher', () => {
  xbo.ui.isPaletteOpen = false;
  xbo.ui.isLauncherOpen = !xbo.ui.isLauncherOpen;
});
bindShortcut('settings', () => xbo.openSettings());
bindShortcut('switchWindow', openSwitcher);
bindShortcut('notifications', () => void (xbo.ui.isNotificationCenterOpen = !xbo.ui.isNotificationCenterOpen));
bindShortcut('snapLeft', withFocused((windowId) => xbo.windows.snap(windowId, 'left')));
bindShortcut('snapRight', withFocused((windowId) => xbo.windows.snap(windowId, 'right')));
bindShortcut('maximize', withFocused((windowId) => xbo.windows.maximize(windowId)));
bindShortcut('close', withFocused((windowId) => void xbo.requestClose(windowId)));
bindShortcut('newWindow', withFocused((windowId) => {
  const appId = xbo.windows.find(windowId)?.appId;

  if (appId) xbo.openWindow(appId, { isNewWindow: true });
}));
bindShortcut('minimize', withFocused((windowId) => {
  const focused = xbo.windows.find(windowId);

  if (focused && (focused.mode === 'maximized' || focused.snap)) xbo.windows.restore(windowId);
  else xbo.windows.minimize(windowId);
}));

function onKeyup(event: KeyboardEvent): void {
  if (!xbo.ui.isSwitcherOpen || event.key !== 'Control') return;

  const target = xbo.windows.byRecency()[xbo.ui.switcherIndex];

  xbo.ui.isSwitcherOpen = false;

  if (target) xbo.windows.focus(target.id);
}

// A fullscreen desktop owns the page, so it hears every key; an embedded one only hears keys while focus is inside it.
const keyTarget = computed(() => (xbo.shell.isFullscreen ? globalThis.window : root.value));

useEventListener(keyTarget, 'keydown', (event: KeyboardEvent) => xbo.handleKeydown(event));
useEventListener(keyTarget, 'keyup', onKeyup);

onMounted(() => {
  xbo.ui.rootElement = root.value;
  xbo.ui.portalTarget = portalHost.value;

  if (!isResizeObserverSupported.value) startOnce();
});
</script>

<template>
  <div
    ref="root"
    class="xbo-desktop"
    v-bind="xbo.rootAttributes.value"
    :style="{ '--xbo-wallpaper': xbo.wallpaperCss.value }"
    :tabindex="xbo.shell.isFullscreen ? undefined : -1"
  >
    <component :is="'style'">{{ xbo.themeCss.value }}</component>

    <MenuBar v-if="xbo.shell.hasMenuBar" />

    <main class="xb:absolute xb:inset-0" :aria-label="xbo.t('desktop.label')">
      <Transition name="snap-preview">
        <div
          v-if="dropPreview"
          class="snap-preview xb:pointer-events-none xb:absolute xb:rounded-lg"
          :style="{
            left: `${dropPreview.x}px`,
            top: `${dropPreview.y}px`,
            width: `${dropPreview.width}px`,
            height: `${dropPreview.height}px`,
            zIndex: 'var(--xbo-z-snap-preview)',
          }"
          aria-hidden="true"
        />
      </Transition>

      <TransitionGroup name="window">
        <AppWindow v-for="desktopWindow in windows" v-show="desktopWindow.mode !== 'minimized'" :key="desktopWindow.id" :window="desktopWindow" />
      </TransitionGroup>

      <p
        v-if="!xbo.focusedWindow.value && hint"
        class="xb:pointer-events-none xb:absolute xb:inset-x-0 xb:top-[42%] xb:px-6 xb:text-center xb:text-body xb:text-ink-muted"
      >
        {{ hint }}
      </p>
    </main>

    <DesktopTaskbar v-if="xbo.shell.hasTaskbar" />
    <StartLauncher v-if="xbo.shell.hasLauncher" />
    <CommandPalette v-if="xbo.shell.hasPalette" />
    <NotificationCenter v-if="xbo.shell.hasNotifications" />
    <WindowSwitcher />
    <DialogHost />
    <ToastStack />

    <div ref="portalHost" class="xbo-portal-host" />
  </div>
</template>

<style scoped>
.snap-preview {
  background: color-mix(in oklch, var(--xbo-primary) 16%, transparent);
  box-shadow: inset 0 0 0 2px color-mix(in oklch, var(--xbo-primary) 55%, transparent);
  backdrop-filter: blur(6px);
  transition:
    left 160ms var(--xbo-ease-out),
    top 160ms var(--xbo-ease-out),
    width 160ms var(--xbo-ease-out),
    height 160ms var(--xbo-ease-out);
}

.snap-preview-enter-active,
.snap-preview-leave-active {
  transition: opacity 140ms linear;
}

.snap-preview-enter-from,
.snap-preview-leave-to {
  opacity: 0;
}

.window-enter-active {
  transition:
    opacity 200ms var(--xbo-ease-out),
    transform 200ms var(--xbo-ease-out);
}

.window-leave-active {
  transition:
    opacity 160ms var(--xbo-ease-out),
    transform 180ms var(--xbo-ease-out);
}

.window-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.window-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

.window-leave-to.is-minimized,
.window-enter-from.is-minimized {
  transform-origin: 50% 100%;
  transform: translateY(40vh) scale(0.35);
}
</style>
