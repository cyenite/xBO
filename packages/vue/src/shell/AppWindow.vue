<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import { resizeEdges, type DesktopWindow, type SnapZone } from '@xbo-ui/core';
import { useXbo, windowBodyKey, windowIdKey } from '../composables';
import DialogHost from './DialogHost.vue';
import WindowControls from './WindowControls.vue';
import { useWindowGestures } from './useWindowGestures';

const props = defineProps<{
  window: DesktopWindow;
}>();

const xbo = useXbo();
const { isInteracting, startMove, startResize } = useWindowGestures(props.window.id);

const body = ref<HTMLElement | null>(null);

provide(windowIdKey, props.window.id);
provide(windowBodyKey, body);

const app = computed(() => xbo.findApp(props.window.appId));
const isMac = computed(() => xbo.chromeStyle.value === 'macos');
const isFocused = computed(() => xbo.focusedWindow.value?.id === props.window.id);
const isExpanded = computed(() => props.window.mode === 'maximized' || props.window.snap !== null);
const isResizable = computed(() => app.value?.isResizable !== false);
const frameStyle = computed(() => ({
  left: `${props.window.bounds.x}px`,
  top: `${props.window.bounds.y}px`,
  width: `${props.window.bounds.width}px`,
  height: `${props.window.bounds.height}px`,
  zIndex: `calc(var(--xbo-z-window-base) + ${props.window.z})`,
}));

function applyLayout(zone: SnapZone | 'maximize'): void {
  if (zone === 'maximize') xbo.windows.maximize(props.window.id);
  else xbo.windows.snap(props.window.id, zone);
}

function toggleMaximize(): void {
  if (isResizable.value) xbo.windows.toggleMaximize(props.window.id);
}
</script>

<template>
  <section
    class="app-window xb:absolute xb:flex xb:flex-col xb:overflow-hidden xb:bg-window"
    :class="{
      'is-focused': isFocused,
      'is-interacting': isInteracting,
      'is-maximized': window.mode === 'maximized',
      'is-minimized': window.mode === 'minimized',
    }"
    :style="frameStyle"
    :aria-label="window.title"
    @pointerdown.capture="xbo.windows.focus(window.id)"
  >
    <header
      class="xb:relative xb:flex xb:h-10 xb:shrink-0 xb:touch-none xb:items-center xb:border-b xb:border-hairline xb:bg-chrome"
      @pointerdown="startMove"
      @dblclick="toggleMaximize"
    >
      <WindowControls
        v-if="isMac"
        chrome-style="macos"
        :title="window.title"
        :is-dirty="window.isDirty"
        :is-focused="isFocused"
        :is-expanded="isExpanded"
        :is-resizable="isResizable"
        @close="xbo.requestClose(window.id)"
        @minimize="xbo.windows.minimize(window.id)"
        @toggle-maximize="toggleMaximize"
        @layout="applyLayout"
      />

      <div
        class="xb:flex xb:min-w-0 xb:flex-1 xb:items-center xb:gap-2"
        :class="isMac ? 'xb:justify-center xb:pr-[76px]' : 'xb:pl-3'"
      >
        <component :is="app?.icon" v-if="app" width="15" height="15" class="xb:shrink-0 xb:text-ink-muted" aria-hidden="true" />
        <h2 class="xb:truncate xb:text-body xb:font-semibold" :class="isFocused ? 'xb:text-ink' : 'xb:text-ink-subtle'">
          {{ window.title }}
        </h2>
        <span v-if="window.isDirty" class="dirty-dot" :title="xbo.t('window.unsaved')"><span class="xb:sr-only">{{ xbo.t('window.unsaved') }}</span></span>
        <span v-if="window.badge" class="window-badge xbo-figures">{{ window.badge }}</span>
      </div>

      <WindowControls
        v-if="!isMac"
        chrome-style="windows"
        :title="window.title"
        :is-dirty="window.isDirty"
        :is-focused="isFocused"
        :is-expanded="isExpanded"
        :is-resizable="isResizable"
        @close="xbo.requestClose(window.id)"
        @minimize="xbo.windows.minimize(window.id)"
        @toggle-maximize="toggleMaximize"
        @layout="applyLayout"
      />
    </header>

    <div ref="body" class="xb:relative xb:min-h-0 xb:flex-1">
      <component :is="app.component" v-if="app" :window-id="window.id" :app-id="app.id" :params="window.params" />
      <DialogHost :window-id="window.id" />
    </div>

    <template v-if="window.mode === 'normal' && isResizable">
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
  border-radius: var(--xbo-radius-lg);
  box-shadow: var(--xbo-shadow-window-idle);
  transition:
    left 200ms var(--xbo-ease-out),
    top 200ms var(--xbo-ease-out),
    width 200ms var(--xbo-ease-out),
    height 200ms var(--xbo-ease-out),
    box-shadow 160ms linear,
    border-radius 160ms linear;
}

.app-window.is-focused {
  box-shadow: var(--xbo-shadow-window);
}

.app-window.is-interacting {
  transition: box-shadow 160ms linear;
}

.app-window.is-maximized {
  border-radius: 0;
}

.dirty-dot {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 999px;
  background: var(--xbo-ink-muted);
}

.window-badge {
  min-width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 999px;
  padding: 0 5px;
  background: var(--xbo-primary);
  color: var(--xbo-on-primary);
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
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
