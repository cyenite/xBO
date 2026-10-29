<script setup lang="ts">
import { createApp, onBeforeUnmount, onMounted, ref, type App } from 'vue';
import { useData } from 'vitepress';
import type { ThemePresetId } from '@xbo-ui/vue';

const props = withDefaults(
  defineProps<{
    demo?: 'shell' | 'components' | 'grid';
    height?: string;
    preset?: ThemePresetId;
  }>(),
  { demo: 'shell', height: '520px', preset: undefined },
);

const { isDark } = useData();
const mountPoint = ref<HTMLElement | null>(null);
const isReady = ref(false);

let demoApp: App | null = null;

// Each demo is its own Vue app with in-memory storage and no routing, so several desktops can share a page and none
// touches the reader's saved settings. Everything loads on the client only.
onMounted(async () => {
  const [xboModule, notes, grid, components] = await Promise.all([
    import('@xbo-ui/vue'),
    import('./demos/NotesDemo.vue'),
    import('./demos/GridDemo.vue'),
    import('./demos/ComponentsDemo.vue'),
  ]);
  const { XboDesktop, createXbo, defineApp, memoryStorageAdapter } = xboModule;
  const appsByDemo = {
    shell: [
      defineApp({ id: 'notes', label: 'Notes', component: notes.default, isPinned: true, defaultSize: { width: 460, height: 320 } }),
      defineApp({ id: 'files', label: 'Files', component: grid.default, isPinned: true, defaultSize: { width: 620, height: 340 } }),
    ],
    components: [defineApp({ id: 'kit', label: 'Components', component: components.default, isPinned: true, defaultSize: { width: 900, height: 440 } })],
    grid: [defineApp({ id: 'files', label: 'Files', component: grid.default, isPinned: true, defaultSize: { width: 900, height: 440 } })],
  };
  const apps = appsByDemo[props.demo];
  const xbo = createXbo({
    brand: { name: 'Demo' },
    apps,
    theme: props.preset ? { preset: props.preset } : undefined,
    shell: { isFullscreen: false },
    routing: 'none',
    startup: { open: apps.map((app) => app.id), isSessionRestored: false },
    preferences: { storage: memoryStorageAdapter(), defaults: { appearance: isDark.value ? 'dark' : 'light' } },
  });

  if (!mountPoint.value) return;

  demoApp = createApp(XboDesktop).use(xbo);
  demoApp.mount(mountPoint.value);
  isReady.value = true;
});

onBeforeUnmount(() => demoApp?.unmount());
</script>

<template>
  <div class="demo-frame vp-raw" :style="{ height }">
    <div ref="mountPoint" class="demo-mount" />
    <p v-if="!isReady" class="demo-loading">Loading the demo desktop…</p>
  </div>
</template>

<style scoped>
.demo-frame {
  position: relative;
  overflow: hidden;
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}

.demo-mount,
.demo-mount :deep(.xbo-desktop) {
  height: 100%;
}

.demo-loading {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 24px;
  color: var(--vp-c-text-2);
}
</style>
