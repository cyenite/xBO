<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { RiSearchLine } from '../icons';
import { apps, moduleGroups, type AppDefinition } from '../apps/catalog';
import { useWindowsStore } from '../stores/windows';

const isOpen = defineModel<boolean>('open', { required: true });

const windows = useWindowsStore();

const query = ref('');
const searchInput = ref<HTMLInputElement | null>(null);

const pinnedApps = computed(() => apps.filter((app) => app.isPinned));
const matchingApps = computed(() => {
  const needle = query.value.trim().toLowerCase();

  if (needle === '') return [];

  return apps.filter((app) => [app.label, app.summary, ...app.keywords].some((text) => text.toLowerCase().includes(needle)));
});
const groupedApps = computed(() =>
  moduleGroups
    .map((group) => ({ ...group, items: apps.filter((app) => app.group === group.id) }))
    .filter((group) => group.items.length > 0),
);

watch(isOpen, async (isNowOpen) => {
  if (!isNowOpen) return;

  query.value = '';
  await nextTick();
  searchInput.value?.focus();
});

function launch(app: AppDefinition | undefined): void {
  if (!app) return;

  isOpen.value = false;
  windows.open(app.id);
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    isOpen.value = false;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    launch(matchingApps.value[0]);
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="launcher">
      <div
        v-if="isOpen"
        class="fixed inset-0"
        :style="{ zIndex: 'var(--z-launcher)' }"
        @pointerdown.self="isOpen = false"
      >
        <div
          class="launcher-panel material absolute bottom-[72px] left-1/2 flex max-h-[min(640px,calc(100vh-120px))] w-[min(620px,calc(100vw-32px))] -translate-x-1/2 flex-col overflow-hidden rounded-xl shadow-popover"
          role="dialog"
          aria-modal="true"
          aria-label="Start"
          @keydown="onKeydown"
        >
          <div class="p-5 pb-3">
            <label class="flex h-9 items-center gap-2 rounded-sm bg-window px-3 ring-1 ring-field-border focus-within:ring-2 focus-within:ring-primary">
              <RiSearchLine width="16" height="16" class="text-ink-muted" aria-hidden="true" />
              <span class="sr-only">Search apps</span>
              <input
                ref="searchInput"
                v-model="query"
                type="text"
                class="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-subtle"
                placeholder="Search apps, for example “arrears” or “leases”"
              />
            </label>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
            <template v-if="query.trim() !== ''">
              <p class="pb-2 text-label text-ink-muted">Best matches</p>
              <ul v-if="matchingApps.length > 0" class="flex flex-col gap-0.5">
                <li v-for="app in matchingApps" :key="app.id">
                  <button type="button" class="launcher-row" @click="launch(app)">
                    <component :is="app.icon" width="18" height="18" class="text-primary" aria-hidden="true" />
                    <span class="flex min-w-0 flex-col items-start">
                      <span class="text-body font-medium text-ink">{{ app.label }}</span>
                      <span class="truncate text-caption text-ink-muted">{{ app.summary }}</span>
                    </span>
                  </button>
                </li>
              </ul>
              <p v-else class="py-6 text-center text-body text-ink-muted">No app matches “{{ query }}”.</p>
            </template>

            <template v-else>
              <p class="pb-2 text-label text-ink-muted">Pinned</p>
              <ul class="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-1 pb-4">
                <li v-for="app in pinnedApps" :key="app.id">
                  <button type="button" class="launcher-tile" @click="launch(app)">
                    <span class="grid size-10 place-items-center rounded-md bg-window ring-1 ring-hairline">
                      <component :is="app.icon" width="20" height="20" class="text-primary" aria-hidden="true" />
                    </span>
                    <span class="line-clamp-2 text-center text-caption text-ink">{{ app.label }}</span>
                  </button>
                </li>
              </ul>

              <div class="border-t border-hairline pt-3">
                <p class="pb-1 text-label text-ink-muted">All apps</p>
                <section v-for="group in groupedApps" :key="group.id" class="py-1.5">
                  <h3 class="px-2 pb-0.5 text-caption font-semibold text-ink-muted">{{ group.label }}</h3>
                  <ul class="flex flex-col">
                    <li v-for="app in group.items" :key="app.id">
                      <button type="button" class="launcher-row" @click="launch(app)">
                        <component :is="app.icon" width="16" height="16" class="text-ink-muted" aria-hidden="true" />
                        <span class="text-body text-ink">{{ app.label }}</span>
                        <span v-if="app.phase" class="ml-auto text-caption text-ink-subtle">{{ app.phase }}</span>
                      </button>
                    </li>
                  </ul>
                </section>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.launcher-tile {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border-radius: var(--radius-md);
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
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  text-align: left;
  transition: background-color 120ms linear;
}

.launcher-row:hover {
  background: var(--xbo-hover);
}

.launcher-enter-active,
.launcher-leave-active {
  transition: opacity 180ms var(--ease-out-quint);
}

.launcher-enter-active .launcher-panel,
.launcher-leave-active .launcher-panel {
  transition: transform 220ms var(--ease-out-quint);
}

.launcher-enter-from,
.launcher-leave-to {
  opacity: 0;
}

.launcher-enter-from .launcher-panel,
.launcher-leave-to .launcher-panel {
  transform: translate(-50%, 16px);
}
</style>
