<script setup lang="ts">
import { computed } from 'vue';
import { findApp } from '../apps/catalog';
import { usePreferencesStore } from '../stores/preferences';
import { useWindowsStore, type DesktopWindow } from '../stores/windows';
import type { SnapZone } from '../legacy';
import WindowControls from './WindowControls.vue';
import { resizeEdges, useWindowGestures } from './useWindowGestures';

const props = defineProps<{
  window: DesktopWindow;
}>();

const store = useWindowsStore();
const preferences = usePreferencesStore();
const { isInteracting, startMove, startResize } = useWindowGestures(props.window.id);

const app = computed(() => findApp(props.window.appId));
const isFocused = computed(() => store.focusedWindow?.id === props.window.id);
const isExpanded = computed(() => props.window.mode === 'maximized' || props.window.snap !== null);
const isMac = computed(() => preferences.chromeStyle === 'macos');
const frameStyle = computed(() => ({
  left: `${props.window.bounds.x}px`,
  top: `${props.window.bounds.y}px`,
  width: `${props.window.bounds.width}px`,
  height: `${props.window.bounds.height}px`,
  zIndex: `calc(var(--z-window-base) + ${props.window.z})`,
}));

function applyLayout(zone: SnapZone | 'maximize'): void {
  if (zone === 'maximize') store.maximize(props.window.id);
  else store.snap(props.window.id, zone);
}
</script>

<template>
  <section
    class="app-window absolute flex flex-col overflow-hidden bg-window"
    :class="{
      'is-focused': isFocused,
      'is-interacting': isInteracting,
      'is-maximized': window.mode === 'maximized',
      'is-minimized': window.mode === 'minimized',
    }"
    :style="frameStyle"
    :aria-label="window.title"
    @pointerdown.capture="store.focus(window.id)"
  >
    <header
      class="relative flex h-10 shrink-0 touch-none items-center border-b border-hairline bg-chrome"
      @pointerdown="startMove"
      @dblclick="store.toggleMaximize(window.id)"
    >
      <WindowControls
        v-if="isMac"
        chrome-style="macos"
        :title="window.title"
        :is-focused="isFocused"
        :is-expanded="isExpanded"
        @close="store.close(window.id)"
        @minimize="store.minimize(window.id)"
        @toggle-maximize="store.toggleMaximize(window.id)"
        @layout="applyLayout"
      />

      <div
        class="flex min-w-0 flex-1 items-center gap-2"
        :class="isMac ? 'justify-center pr-[76px]' : 'pl-3'"
      >
        <component :is="app?.icon" v-if="app" width="15" height="15" class="shrink-0 text-ink-muted" aria-hidden="true" />
        <h2 class="truncate text-body font-semibold" :class="isFocused ? 'text-ink' : 'text-ink-subtle'">
          {{ window.title }}
        </h2>
      </div>

      <WindowControls
        v-if="!isMac"
        chrome-style="windows"
        :title="window.title"
        :is-focused="isFocused"
        :is-expanded="isExpanded"
        @close="store.close(window.id)"
        @minimize="store.minimize(window.id)"
        @toggle-maximize="store.toggleMaximize(window.id)"
        @layout="applyLayout"
      />
    </header>

    <div class="relative min-h-0 flex-1">
      <component :is="app.component" v-if="app" :window-id="window.id" :app-id="app.id" />
    </div>

    <template v-if="window.mode === 'normal'">
      <div
        v-for="edge in resizeEdges"
        :key="edge"
        class="resize-handle"
        :class="`resize-${edge}`"
        aria-hidden="true"
        @pointerdown="startResize($event, edge)"
      />
    </template>
  </section>
</template>

<style scoped>
.app-window {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-window-idle);
  transition:
    left 200ms var(--ease-out-quint),
    top 200ms var(--ease-out-quint),
    width 200ms var(--ease-out-quint),
    height 200ms var(--ease-out-quint),
    box-shadow 160ms linear,
    border-radius 160ms linear;
}

.app-window.is-focused {
  box-shadow: var(--shadow-window);
}

.app-window.is-interacting {
  transition: box-shadow 160ms linear;
}

.app-window.is-maximized {
  border-radius: 0;
}

.resize-handle {
  position: absolute;
  z-index: 2;
  touch-action: none;
}

.resize-n,
.resize-s {
  left: 8px;
  right: 8px;
  height: 6px;
  cursor: ns-resize;
}

.resize-n {
  top: -3px;
}

.resize-s {
  bottom: -3px;
}

.resize-e,
.resize-w {
  top: 8px;
  bottom: 8px;
  width: 6px;
  cursor: ew-resize;
}

.resize-e {
  right: -3px;
}

.resize-w {
  left: -3px;
}

.resize-ne,
.resize-nw,
.resize-se,
.resize-sw {
  width: 12px;
  height: 12px;
}

.resize-ne {
  top: -3px;
  right: -3px;
  cursor: nesw-resize;
}

.resize-nw {
  top: -3px;
  left: -3px;
  cursor: nwse-resize;
}

.resize-se {
  bottom: -3px;
  right: -3px;
  cursor: nwse-resize;
}

.resize-sw {
  bottom: -3px;
  left: -3px;
  cursor: nesw-resize;
}
</style>
