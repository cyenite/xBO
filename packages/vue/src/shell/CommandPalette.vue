<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { formatBinding, rankSearchables } from '@xbo-ui/core';
import { useXbo } from '../composables';
import { builtInAppIds } from '../config';
import type { Command } from '../instance';
import { RiAppsLine, RiArrowLeftRightLine, RiCheckboxBlankLine, RiCloseLine, RiCornerDownLeftLine, RiMoonLine, RiSearchLine, RiSettings3Line, RiSubtractLine, RiSunLine } from '../icons';

const xbo = useXbo();
const query = ref('');
const activeIndex = ref(0);
const inputElement = ref<HTMLInputElement | null>(null);

const isOpen = computed(() => xbo.ui.isPaletteOpen);

const builtInCommands = computed<Command[]>(() => {
  const focused = xbo.focusedWindow.value;
  const appCommands: Command[] = xbo.apps
    .filter((app) => !app.isHidden)
    .map((app) => ({ id: `xbo:open:${app.id}`, icon: app.icon ?? RiAppsLine, label: app.label, detail: app.summary, section: 'apps', keywords: app.keywords, run: () => void xbo.openWindow(app.id) }));
  const windowCommands: Command[] = xbo.windows.byRecency().map((openWindow) => ({
    id: `xbo:focus:${openWindow.id}`,
    icon: xbo.findApp(openWindow.appId)?.icon ?? RiAppsLine,
    label: xbo.t('command.focusWindow', { title: openWindow.title }),
    section: 'windows',
    keywords: [openWindow.title],
    run: () => xbo.windows.focus(openWindow.id),
  }));
  const focusedCommands: Command[] = focused
    ? [
        { id: 'xbo:snap-left', icon: RiArrowLeftRightLine, label: xbo.t('command.snapLeft', { title: focused.title }), section: 'window', keywords: ['snap', 'left', 'tile', 'split'], shortcutId: 'snapLeft', run: () => xbo.windows.snap(focused.id, 'left') },
        { id: 'xbo:snap-right', icon: RiArrowLeftRightLine, label: xbo.t('command.snapRight', { title: focused.title }), section: 'window', keywords: ['snap', 'right', 'tile', 'split'], shortcutId: 'snapRight', run: () => xbo.windows.snap(focused.id, 'right') },
        {
          id: 'xbo:maximize',
          icon: RiCheckboxBlankLine,
          label: xbo.t(focused.mode === 'maximized' ? 'command.restore' : 'command.maximize', { title: focused.title }),
          section: 'window',
          keywords: ['maximise', 'maximize', 'zoom', 'full', 'restore'],
          shortcutId: 'maximize',
          run: () => xbo.windows.toggleMaximize(focused.id),
        },
        { id: 'xbo:minimize', icon: RiSubtractLine, label: xbo.t('command.minimize', { title: focused.title }), section: 'window', keywords: ['minimise', 'minimize', 'hide'], shortcutId: 'minimize', run: () => xbo.windows.minimize(focused.id) },
        { id: 'xbo:close', icon: RiCloseLine, label: xbo.t('command.close', { title: focused.title }), section: 'window', keywords: ['close', 'quit'], shortcutId: 'close', run: () => void xbo.requestClose(focused.id) },
      ]
    : [];
  const viewCommands: Command[] = [
    {
      id: 'xbo:appearance',
      icon: xbo.isDark.value ? RiSunLine : RiMoonLine,
      label: xbo.t(xbo.isDark.value ? 'command.switchToLight' : 'command.switchToDark'),
      section: 'view',
      keywords: ['theme', 'dark', 'light', 'appearance', 'mode'],
      run: () => void xbo.setPreference('appearance', xbo.isDark.value ? 'light' : 'dark'),
    },
    {
      id: 'xbo:window-chrome',
      icon: RiCheckboxBlankLine,
      label: xbo.t(xbo.chromeStyle.value === 'macos' ? 'command.useWindowsControls' : 'command.useMacControls'),
      section: 'view',
      keywords: ['window controls', 'traffic lights', 'caption buttons', 'macos', 'windows'],
      run: () => void xbo.setPreference('windowChrome', xbo.chromeStyle.value === 'macos' ? 'windows' : 'macos'),
    },
    { id: 'xbo:show-desktop', icon: RiSubtractLine, label: xbo.t('command.showDesktop'), section: 'view', keywords: ['desktop', 'minimise all', 'hide all'], run: () => xbo.windows.minimizeAll() },
    { id: 'xbo:settings', icon: RiSettings3Line, label: xbo.t('command.openSettings'), section: 'view', keywords: ['preferences', 'options'], shortcutId: 'settings', run: () => void xbo.openWindow(builtInAppIds.settings) },
  ];

  return [...appCommands, ...windowCommands, ...focusedCommands, ...viewCommands];
});

const sectionLabels = computed<Record<string, string>>(() => ({
  apps: xbo.t('palette.section.apps'),
  windows: xbo.t('palette.section.windows'),
  window: xbo.t('palette.section.window'),
  view: xbo.t('palette.section.view'),
}));

// Built-in sections bracket the developer's: apps and windows first, their commands next, window and view last.
const sections = computed(() => {
  const registered = [...xbo.commands.values()];
  const all = [...builtInCommands.value, ...registered];
  const results = rankSearchables(all, query.value);
  const customSections = [...new Set(registered.map((command) => command.section))].filter((section) => !(section in sectionLabels.value));
  const order = ['apps', 'windows', ...customSections, 'window', 'view'];

  return order
    .map((section) => ({ id: section, label: sectionLabels.value[section] ?? section, items: results.filter((command) => command.section === section) }))
    .filter((section) => section.items.length > 0);
});

const orderedResults = computed(() => sections.value.flatMap((section) => section.items));

watch(isOpen, async (isNowOpen) => {
  if (!isNowOpen) return;

  query.value = '';
  activeIndex.value = 0;
  await nextTick();
  inputElement.value?.focus();
});

watch(query, () => (activeIndex.value = 0));

function close(): void {
  xbo.ui.isPaletteOpen = false;
}

function run(command: Command | undefined): void {
  if (!command) return;

  close();
  command.run();
}

function shortcutFor(command: Command): string {
  return command.shortcutId ? (xbo.shortcutDefinitions.has(command.shortcutId) ? xbo.shortcutLabel(command.shortcutId) : formatBinding(command.shortcutId, xbo.os)) : '';
}

function onKeydown(event: KeyboardEvent): void {
  const count = orderedResults.value.length;

  if (event.key === 'Escape') {
    event.preventDefault();
    close();
  } else if (event.key === 'ArrowDown' && count > 0) {
    event.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % count;
  } else if (event.key === 'ArrowUp' && count > 0) {
    event.preventDefault();
    activeIndex.value = (activeIndex.value - 1 + count) % count;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    run(orderedResults.value[activeIndex.value]);
  }
}

function indexOf(command: Command): number {
  return orderedResults.value.indexOf(command);
}

function optionId(command: Command): string {
  return `${xbo.id}-command-${command.id.replace(/[^\w-]/g, '_')}`;
}
</script>

<template>
  <Transition name="palette">
    <div v-if="isOpen" class="xb:absolute xb:inset-0 xb:flex xb:justify-center xb:pt-[14vh]" :style="{ zIndex: 'var(--xbo-z-palette)' }" @pointerdown.self="close">
      <div
        class="palette-panel xbo-material xb:flex xb:h-fit xb:max-h-[min(520px,70%)] xb:w-[min(640px,calc(100%-32px))] xb:flex-col xb:overflow-hidden xb:rounded-xl xb:shadow-popover"
        role="dialog"
        aria-modal="true"
        :aria-label="xbo.t('palette.label')"
      >
        <div class="xb:flex xb:items-center xb:gap-3 xb:border-b xb:border-hairline xb:px-4">
          <RiSearchLine width="18" height="18" class="xb:shrink-0 xb:text-ink-muted" aria-hidden="true" />
          <input
            ref="inputElement"
            v-model="query"
            type="text"
            class="xb:h-12 xb:min-w-0 xb:flex-1 xb:bg-transparent xb:text-title xb:text-ink xb:outline-none xb:placeholder:text-ink-subtle"
            :placeholder="xbo.t('palette.placeholder')"
            role="combobox"
            aria-expanded="true"
            :aria-controls="`${xbo.id}-command-results`"
            :aria-activedescendant="orderedResults[activeIndex] ? optionId(orderedResults[activeIndex]!) : undefined"
            @keydown="onKeydown"
          />
        </div>
        <div :id="`${xbo.id}-command-results`" class="xb:min-h-0 xb:flex-1 xb:overflow-y-auto xb:p-2" role="listbox" :aria-label="xbo.t('palette.label')">
          <div v-for="section in sections" :key="section.id" role="group" :aria-label="section.label">
            <p class="xb:px-2 xb:pt-2 xb:pb-1 xb:text-label xb:text-ink-muted" aria-hidden="true">{{ section.label }}</p>
            <div
              v-for="command in section.items"
              :id="optionId(command)"
              :key="command.id"
              role="option"
              :aria-selected="indexOf(command) === activeIndex"
              class="xb:flex xb:h-9 xb:cursor-default xb:items-center xb:gap-3 xb:rounded-sm xb:px-2"
              :class="indexOf(command) === activeIndex ? 'xb:bg-primary-soft' : ''"
              @pointermove="activeIndex = indexOf(command)"
              @click="run(command)"
            >
              <component :is="command.icon" v-if="command.icon" width="16" height="16" class="xb:shrink-0 xb:text-ink-muted" aria-hidden="true" />
              <span class="xb:truncate xb:text-body xb:text-ink">{{ command.label }}</span>
              <span v-if="command.detail" class="xb:hidden xb:truncate xb:text-caption xb:text-ink-subtle xb:sm:inline">{{ command.detail }}</span>
              <span class="xb:ml-auto xb:shrink-0 xb:text-caption xb:text-ink-subtle">
                <kbd v-if="shortcutFor(command)" class="xb:font-sans">{{ shortcutFor(command) }}</kbd>
                <RiCornerDownLeftLine v-else-if="indexOf(command) === activeIndex" width="14" height="14" aria-hidden="true" />
              </span>
            </div>
          </div>
          <p v-if="orderedResults.length === 0" class="xb:px-3 xb:py-8 xb:text-center xb:text-body xb:text-ink-muted">
            {{ xbo.t('palette.noResults', { query }) }}
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.palette-enter-active,
.palette-leave-active {
  transition: opacity 160ms var(--xbo-ease-out);
}

.palette-enter-active .palette-panel,
.palette-leave-active .palette-panel {
  transition: transform 180ms var(--xbo-ease-out);
}

.palette-enter-from,
.palette-leave-to {
  opacity: 0;
}

.palette-enter-from .palette-panel,
.palette-leave-to .palette-panel {
  transform: translateY(-6px) scale(0.985);
}
</style>
