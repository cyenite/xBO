<script setup lang="ts">
import { computed } from 'vue';
import { RiSearchLine } from '../icons';
import { apps } from '../apps/catalog';
import { useWindowsStore } from '../stores/windows';
import { shortcuts } from './commands';
import XboMark from './XboMark.vue';

defineProps<{
  isLauncherOpen: boolean;
}>();

const emit = defineEmits<{
  toggleLauncher: [];
  openPalette: [];
}>();

const windows = useWindowsStore();

const taskbarApps = computed(() => apps.filter((app) => app.isPinned || windows.runningAppIds.has(app.id)));

function stateFor(appId: string): 'focused' | 'running' | 'idle' {
  if (windows.focusedWindow?.appId === appId) return 'focused';

  return windows.runningAppIds.has(appId) ? 'running' : 'idle';
}
</script>

<template>
  <nav
    class="material fixed bottom-2 left-1/2 flex h-[52px] -translate-x-1/2 items-center gap-1 rounded-xl px-1.5 shadow-taskbar"
    :style="{ zIndex: 'var(--z-taskbar)' }"
    aria-label="Taskbar"
  >
    <button
      type="button"
      class="taskbar-button"
      :class="{ 'is-pressed': isLauncherOpen }"
      :aria-expanded="isLauncherOpen"
      aria-label="Start"
      :data-tooltip="`Start (${shortcuts.launcher})`"
      @click="emit('toggleLauncher')"
    >
      <XboMark class="size-[26px]" />
    </button>
    <button
      type="button"
      class="taskbar-button"
      aria-label="Search"
      :data-tooltip="`Search (${shortcuts.palette})`"
      @click="emit('openPalette')"
    >
      <RiSearchLine width="20" height="20" class="text-ink" aria-hidden="true" />
    </button>

    <span class="mx-1 h-6 w-px bg-hairline" aria-hidden="true"></span>

    <button
      v-for="app in taskbarApps"
      :key="app.id"
      type="button"
      class="taskbar-button"
      :class="`is-${stateFor(app.id)}`"
      :aria-label="app.label"
      :aria-pressed="stateFor(app.id) === 'focused'"
      :data-tooltip="app.label"
      @click="windows.activateApp(app.id)"
    >
      <span class="grid size-[30px] place-items-center rounded-md bg-window ring-1 ring-hairline">
        <component :is="app.icon" width="18" height="18" class="text-primary" aria-hidden="true" />
      </span>
      <span class="running-indicator" aria-hidden="true"></span>
    </button>
  </nav>
</template>

<style scoped>
.taskbar-button {
  position: relative;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  transition: background-color 120ms linear;
}

.taskbar-button:hover,
.taskbar-button.is-pressed,
.taskbar-button.is-focused {
  background: var(--xbo-hover);
}

.taskbar-button:active > :first-child {
  transform: scale(0.92);
}

.taskbar-button > :first-child {
  transition: transform 160ms var(--ease-out-quint);
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
  transition: width 200ms var(--ease-out-quint), background-color 200ms linear;
}

.is-running .running-indicator {
  width: 6px;
}

.is-focused .running-indicator {
  width: 16px;
  background: var(--xbo-primary);
}

.taskbar-button[data-tooltip]:hover::after,
.taskbar-button[data-tooltip]:focus-visible::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  z-index: var(--z-tooltip);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  background: var(--xbo-raised);
  box-shadow: var(--shadow-popover);
  color: var(--xbo-ink);
  font-size: 12px;
  white-space: nowrap;
  transform: translateX(-50%);
  pointer-events: none;
}
</style>
