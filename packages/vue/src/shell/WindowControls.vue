<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import type { SnapZone, WindowChromeStyle } from '@xbo-ui/core';
import { useXbo } from '../composables';
import { RiCheckboxBlankLine, RiCheckboxMultipleBlankLine, RiCloseLine, RiSubtractLine } from '../icons';
import { rootRect } from './rootGeometry';
import SnapLayoutFlyout from './SnapLayoutFlyout.vue';

const props = defineProps<{
  title: string;
  chromeStyle: WindowChromeStyle;
  isDirty: boolean;
  isFocused: boolean;
  isExpanded: boolean;
  isResizable: boolean;
}>();

const emit = defineEmits<{
  close: [];
  minimize: [];
  toggleMaximize: [];
  layout: [zone: SnapZone | 'maximize'];
}>();

const flyoutWidth = 252;

const xbo = useXbo();
const flyoutTop = ref(0);
const flyoutLeft = ref(0);
const isFlyoutOpen = ref(false);

let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleFlyout(event: PointerEvent): void {
  if (!props.isResizable) return;

  const anchor = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const root = rootRect(xbo);

  clearTimeout(closeTimer);
  openTimer = setTimeout(() => {
    flyoutTop.value = anchor.bottom - root.top + 6;
    flyoutLeft.value = Math.min(Math.max(8, anchor.left - root.left + anchor.width / 2 - flyoutWidth / 2), root.width - flyoutWidth - 8);
    isFlyoutOpen.value = true;
  }, 450);
}

function scheduleClose(): void {
  clearTimeout(openTimer);
  closeTimer = setTimeout(() => (isFlyoutOpen.value = false), 220);
}

function keepFlyoutOpen(): void {
  clearTimeout(closeTimer);
}

function pickLayout(zone: SnapZone | 'maximize'): void {
  isFlyoutOpen.value = false;
  emit('layout', zone);
}

onBeforeUnmount(() => {
  clearTimeout(openTimer);
  clearTimeout(closeTimer);
});
</script>

<template>
  <div v-if="props.chromeStyle === 'macos'" class="traffic-lights xb:flex xb:items-center xb:gap-2 xb:px-3" :class="{ 'is-idle': !isFocused, 'is-dirty': isDirty }" data-no-drag>
    <button type="button" class="traffic traffic-close" :aria-label="`${xbo.t('window.close')} ${title}`" @click="emit('close')">
      <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 3.5l5 5m0-5l-5 5" /></svg>
    </button>
    <button type="button" class="traffic traffic-minimize" :aria-label="`${xbo.t('window.minimize')} ${title}`" @click="emit('minimize')">
      <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.8 6h6.4" /></svg>
    </button>
    <button
      type="button"
      class="traffic traffic-zoom"
      :aria-label="`${xbo.t(isExpanded ? 'window.restore' : 'window.maximize')} ${title}`"
      :disabled="!isResizable"
      aria-haspopup="menu"
      @click="emit('toggleMaximize')"
      @pointerenter="scheduleFlyout"
      @pointerleave="scheduleClose"
    >
      <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.6 8.4V4.8L7.2 8.4zM8.4 3.6v3.6L4.8 3.6z" class="fill" /></svg>
    </button>
  </div>

  <div v-else class="xb:flex xb:h-full xb:items-stretch" data-no-drag>
    <button type="button" class="caption-button" :aria-label="`${xbo.t('window.minimize')} ${title}`" @click="emit('minimize')">
      <RiSubtractLine width="16" height="16" aria-hidden="true" />
    </button>
    <button
      type="button"
      class="caption-button"
      :aria-label="`${xbo.t(isExpanded ? 'window.restore' : 'window.maximize')} ${title}`"
      :disabled="!isResizable"
      aria-haspopup="menu"
      @click="emit('toggleMaximize')"
      @pointerenter="scheduleFlyout"
      @pointerleave="scheduleClose"
    >
      <RiCheckboxMultipleBlankLine v-if="isExpanded" width="14" height="14" aria-hidden="true" />
      <RiCheckboxBlankLine v-else width="14" height="14" aria-hidden="true" />
    </button>
    <button type="button" class="caption-button caption-close" :aria-label="`${xbo.t('window.close')} ${title}`" @click="emit('close')">
      <RiCloseLine width="17" height="17" aria-hidden="true" />
    </button>
  </div>

  <SnapLayoutFlyout
    v-if="isFlyoutOpen"
    :top="flyoutTop"
    :left="flyoutLeft"
    @pick="pickLayout"
    @enter="keepFlyoutOpen"
    @leave="scheduleClose"
  />
</template>

<style scoped>
.traffic {
  display: grid;
  place-items: center;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  box-shadow: inset 0 0 0 0.5px rgb(0 0 0 / 0.18);
  transition: background-color 150ms var(--xbo-ease-out);
}

.traffic svg {
  width: 8px;
  height: 8px;
  opacity: 0;
  stroke: rgb(0 0 0 / 0.55);
  stroke-width: 1.4;
  stroke-linecap: round;
  fill: none;
  transition: opacity 120ms var(--xbo-ease-out);
}

.traffic svg .fill {
  fill: rgb(0 0 0 / 0.55);
  stroke: none;
}

.traffic-lights:hover .traffic svg,
.traffic:focus-visible svg {
  opacity: 1;
}

.traffic-close {
  background: var(--xbo-traffic-close);
}

.traffic-minimize {
  background: var(--xbo-traffic-minimize);
}

.traffic-zoom {
  background: var(--xbo-traffic-zoom);
}

.is-idle:not(:hover) .traffic {
  background: var(--xbo-traffic-idle);
}

.caption-button {
  display: grid;
  place-items: center;
  width: 46px;
  color: var(--xbo-ink);
  transition: background-color 120ms linear, color 120ms linear;
}

.caption-button:hover {
  background: var(--xbo-hover);
}

.caption-button:active {
  background: var(--xbo-pressed);
}

.caption-close:hover,
.caption-close:focus-visible {
  background: var(--xbo-caption-close);
  color: oklch(1 0 0);
}

.caption-button:focus-visible {
  outline-offset: -2px;
}
</style>
