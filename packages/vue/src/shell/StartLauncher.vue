<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { rankSearchables } from '@xbo-ui/core';
import { useXbo } from '../composables';
import type { AppDefinition } from '../config';
import { RiAppsLine, RiSearchLine, RiSettings3Line } from '../icons';

const xbo = useXbo();
const query = ref('');
const searchInput = ref<HTMLInputElement | null>(null);

const isOpen = computed(() => xbo.ui.isLauncherOpen);
const visibleApps = computed(() => xbo.apps.filter((app) => !app.isHidden));
const pinnedApps = computed(() => xbo.pinnedAppIds.value.map((appId) => xbo.findApp(appId)).filter((app): app is AppDefinition => !!app));
const matchingApps = computed(() => rankSearchables(visibleApps.value, query.value));
const panelPosition = computed(() => `is-${xbo.preferences.taskbarPosition}-${xbo.preferences.taskbarAlignment}`);

watch(isOpen, async (isNowOpen) => {
  if (!isNowOpen) return;

  query.value = '';
  await nextTick();
  searchInput.value?.focus();
});

function close(): void {
  xbo.ui.isLauncherOpen = false;
}

function launch(app: AppDefinition | undefined): void {
  if (app) xbo.openWindow(app.id);
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    close();
  } else if (event.key === 'Enter' && event.target === searchInput.value) {
    event.preventDefault();
    launch(matchingApps.value[0]);
  }
}
</script>

<template>
  <Transition name="launcher">
    <div v-if="isOpen" class="xb:absolute xb:inset-0" :style="{ zIndex: 'var(--xbo-z-launcher)' }" @pointerdown.self="close">
      <div
        class="launcher-panel xbo-material xb:absolute xb:flex xb:max-h-[min(640px,calc(100%-120px))] xb:w-[min(620px,calc(100%-32px))] xb:flex-col xb:overflow-hidden xb:rounded-xl xb:shadow-popover"
        :class="panelPosition"
        role="dialog"
        aria-modal="true"
        :aria-label="xbo.t('taskbar.start')"
        @keydown="onKeydown"
      >
        <div class="xb:p-5 xb:pb-3">
          <label class="xb:flex xb:h-9 xb:items-center xb:gap-2 xb:rounded-sm xb:bg-window xb:px-3 xb:ring-1 xb:ring-field-border xb:focus-within:ring-2 xb:focus-within:ring-primary">
            <RiSearchLine width="16" height="16" class="xb:text-ink-muted" aria-hidden="true" />
            <span class="xb:sr-only">{{ xbo.t('taskbar.search') }}</span>
            <input
              ref="searchInput"
              v-model="query"
              type="text"
              class="xb:min-w-0 xb:flex-1 xb:bg-transparent xb:text-body xb:text-ink xb:outline-none xb:placeholder:text-ink-subtle"
              :placeholder="xbo.t('launcher.search')"
            />
          </label>
        </div>

        <div class="xb:min-h-0 xb:flex-1 xb:overflow-y-auto xb:px-5 xb:pb-4">
          <template v-if="query.trim() !== ''">
            <ul v-if="matchingApps.length > 0" class="xb:flex xb:flex-col xb:gap-0.5">
              <li v-for="app in matchingApps" :key="app.id">
                <button type="button" class="launcher-row" @click="launch(app)">
                  <component :is="app.icon ?? RiAppsLine" width="18" height="18" class="xb:text-primary" aria-hidden="true" />
                  <span class="xb:flex xb:min-w-0 xb:flex-col xb:items-start">
                    <span class="xb:text-body xb:font-medium xb:text-ink">{{ app.label }}</span>
                    <span v-if="app.summary" class="xb:max-w-full xb:truncate xb:text-caption xb:text-ink-muted">{{ app.summary }}</span>
                  </span>
                </button>
              </li>
            </ul>
            <p v-else class="xb:py-6 xb:text-center xb:text-body xb:text-ink-muted">{{ xbo.t('launcher.noResults', { query }) }}</p>
          </template>

          <template v-else>
            <template v-if="pinnedApps.length > 0">
              <p class="xb:pb-2 xb:text-label xb:text-ink-muted">{{ xbo.t('launcher.pinned') }}</p>
              <ul class="xb:grid xb:grid-cols-[repeat(auto-fill,minmax(96px,1fr))] xb:gap-1 xb:pb-4">
                <li v-for="app in pinnedApps" :key="app.id">
                  <button type="button" class="launcher-tile" @click="launch(app)">
                    <span class="xb:grid xb:size-10 xb:place-items-center xb:rounded-md xb:bg-window xb:ring-1 xb:ring-hairline">
                      <component :is="app.icon ?? RiAppsLine" width="20" height="20" class="xb:text-primary" aria-hidden="true" />
                    </span>
                    <span class="xb:line-clamp-2 xb:text-center xb:text-caption xb:text-ink">{{ app.label }}</span>
                  </button>
                </li>
              </ul>
            </template>

            <div class="xb:border-t xb:border-hairline xb:pt-3">
              <p class="xb:pb-1 xb:text-label xb:text-ink-muted">{{ xbo.t('launcher.allApps') }}</p>
              <section v-for="section in xbo.appSections.value" :key="section.id" class="xb:py-1.5">
                <h3 v-if="xbo.appSections.value.length > 1" class="xb:px-2 xb:pb-0.5 xb:text-caption xb:font-semibold xb:text-ink-muted">{{ section.label }}</h3>
                <ul class="xb:flex xb:flex-col">
                  <li v-for="app in section.apps" :key="app.id">
                    <button type="button" class="launcher-row" @click="launch(app)">
                      <component :is="app.icon ?? RiAppsLine" width="16" height="16" class="xb:text-ink-muted" aria-hidden="true" />
                      <span class="xb:text-body xb:text-ink">{{ app.label }}</span>
                    </button>
                  </li>
                </ul>
              </section>
            </div>
          </template>
        </div>

        <footer class="xb:flex xb:items-center xb:justify-between xb:border-t xb:border-hairline xb:px-5 xb:py-2.5">
          <span class="xb:flex xb:items-center xb:gap-2 xb:text-caption xb:text-ink-muted">{{ xbo.brand.name }}</span>
          <button type="button" class="launcher-row xb:w-auto" @click="xbo.openSettings()">
            <RiSettings3Line width="16" height="16" class="xb:text-ink-muted" aria-hidden="true" />
            <span class="xb:text-body xb:text-ink">{{ xbo.t('settings.title') }}</span>
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.launcher-panel.is-bottom-center {
  bottom: 72px;
  left: 50%;
  translate: -50% 0;
}

.launcher-panel.is-bottom-start {
  bottom: 72px;
  left: 16px;
}

.launcher-panel.is-left-center,
.launcher-panel.is-left-start {
  top: 46px;
  left: 76px;
}

.launcher-panel.is-right-center,
.launcher-panel.is-right-start {
  top: 46px;
  right: 76px;
}

.launcher-tile {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border-radius: var(--xbo-radius-md);
  padding: 10px 6px 8px;
  transition: background-color 120ms linear;
}

.launcher-tile:hover {
  background: var(--xbo-hover);
}

.launcher-row {
  display: flex;
  width: 100%;
  min-height: 32px;
  align-items: center;
  gap: 10px;
  border-radius: var(--xbo-radius-sm);
  padding: 4px 8px;
  text-align: left;
  transition: background-color 120ms linear;
}

.launcher-row:hover {
  background: var(--xbo-hover);
}

.launcher-enter-active,
.launcher-leave-active {
  transition: opacity 180ms var(--xbo-ease-out);
}

.launcher-enter-active .launcher-panel,
.launcher-leave-active .launcher-panel {
  transition: transform 220ms var(--xbo-ease-out);
}

.launcher-enter-from,
.launcher-leave-to {
  opacity: 0;
}

.launcher-enter-from .launcher-panel,
.launcher-leave-to .launcher-panel {
  transform: translateY(16px);
}
</style>
