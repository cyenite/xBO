<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useEventListener, useWindowSize } from '@vueuse/core';
import { findApp } from '../apps/catalog';
import { hasPrimaryModifier, primaryModifierLabel } from '../legacy';
import { usePreferencesStore } from '../stores/preferences';
import { useWindowsStore } from '../stores/windows';
import AppWindow from './AppWindow.vue';
import CommandPalette from './CommandPalette.vue';
import MenuBar from './MenuBar.vue';
import StartLauncher from './StartLauncher.vue';
import DesktopTaskbar from './DesktopTaskbar.vue';

const menuBarHeight = 30;
const taskbarReserve = 68;

const windows = useWindowsStore();
const preferences = usePreferencesStore();
const viewport = useWindowSize();

const isPaletteOpen = ref(false);
const isLauncherOpen = ref(false);

watch(
  [viewport.width, viewport.height],
  ([width, height]) => windows.setWorkspace({ x: 0, y: menuBarHeight, width, height: height - menuBarHeight - taskbarReserve }),
  { immediate: true },
);

watch(
  () => [preferences.isDark, preferences.isTransparencyReduced, preferences.density] as const,
  ([isDark, isTransparencyReduced, density]) => {
    const root = document.documentElement;

    root.classList.toggle('dark', isDark);
    root.dataset.transparency = isTransparencyReduced ? 'reduced' : 'system';
    root.dataset.density = density;
  },
  { immediate: true },
);

watch(
  () => windows.focusedWindow?.appId,
  (appId) => history.replaceState(null, '', appId ? `#/${appId}` : location.pathname + location.search),
);

onMounted(() => {
  const linkedAppId = location.hash.replace(/^#\/?/, '');

  windows.open(findApp(linkedAppId) ? linkedAppId : 'overview');
});

function openPalette(): void {
  isLauncherOpen.value = false;
  isPaletteOpen.value = true;
}

function toggleLauncher(): void {
  isPaletteOpen.value = false;
  isLauncherOpen.value = !isLauncherOpen.value;
}

useEventListener(window, 'keydown', (event: KeyboardEvent) => {
  const focused = windows.focusedWindow;
  const key = event.key.toLowerCase();

  if (hasPrimaryModifier(event) && !event.altKey && key === 'k') {
    event.preventDefault();

    if (isPaletteOpen.value) isPaletteOpen.value = false;
    else openPalette();
  } else if (event.ctrlKey && key === 'escape') {
    event.preventDefault();
    toggleLauncher();
  } else if (event.ctrlKey && event.altKey && focused) {
    if (key === 'arrowleft') windows.snap(focused.id, 'left');
    else if (key === 'arrowright') windows.snap(focused.id, 'right');
    else if (key === 'arrowup') windows.maximize(focused.id);
    else if (key === 'arrowdown' && (focused.mode === 'maximized' || focused.snap)) windows.restore(focused.id);
    else if (key === 'arrowdown') windows.minimize(focused.id);
    else if (key === 'w') windows.close(focused.id);
    else return;

    event.preventDefault();
  }
});
</script>

<template>
  <div class="desktop relative h-full w-full overflow-hidden bg-desktop">
    <MenuBar @open-palette="openPalette" />

    <main class="absolute inset-0" aria-label="Desktop">
      <Transition name="snap-preview">
        <div
          v-if="windows.dropPreview"
          class="snap-preview pointer-events-none absolute rounded-lg"
          :style="{
            left: `${windows.dropPreview.x}px`,
            top: `${windows.dropPreview.y}px`,
            width: `${windows.dropPreview.width}px`,
            height: `${windows.dropPreview.height}px`,
            zIndex: 'var(--z-snap-preview)',
          }"
          aria-hidden="true"
        />
      </Transition>

      <TransitionGroup name="window">
        <AppWindow
          v-for="desktopWindow in windows.windows"
          v-show="desktopWindow.mode !== 'minimized'"
          :key="desktopWindow.id"
          :window="desktopWindow"
        />
      </TransitionGroup>

      <p
        v-if="!windows.focusedWindow"
        class="pointer-events-none absolute inset-x-0 top-[42%] text-center text-body text-ink-muted"
      >
        Open an app from the taskbar, or press {{ primaryModifierLabel }} K to find anything.
      </p>
    </main>

    <DesktopTaskbar :is-launcher-open="isLauncherOpen" @toggle-launcher="toggleLauncher" @open-palette="openPalette" />
    <StartLauncher v-model:open="isLauncherOpen" />
    <CommandPalette v-model:open="isPaletteOpen" />
  </div>
</template>

<style scoped>
.snap-preview {
  background: color-mix(in oklch, var(--xbo-primary) 16%, transparent);
  box-shadow: inset 0 0 0 2px color-mix(in oklch, var(--xbo-primary) 55%, transparent);
  backdrop-filter: blur(6px);
  transition: left 160ms var(--ease-out-quint), top 160ms var(--ease-out-quint), width 160ms var(--ease-out-quint), height 160ms var(--ease-out-quint);
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
  transition: opacity 200ms var(--ease-out-quint), transform 200ms var(--ease-out-quint);
}

.window-leave-active {
  transition: opacity 160ms var(--ease-out-quint), transform 180ms var(--ease-out-quint);
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
