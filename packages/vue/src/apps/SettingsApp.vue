<script setup lang="ts">
import { computed, markRaw, ref, watch, type Component } from 'vue';
import { useCurrentWindow, useXbo } from '../composables';
import { RiGlobalLine, RiInformationLine, RiKeyboardLine, RiLayoutBottomLine, RiPaletteLine, RiWindowLine } from '../icons';
import AboutSection from './settings/AboutSection.vue';
import AppearanceSection from './settings/AppearanceSection.vue';
import KeyboardSection from './settings/KeyboardSection.vue';
import LanguageSection from './settings/LanguageSection.vue';
import TaskbarSection from './settings/TaskbarSection.vue';
import WindowsSection from './settings/WindowsSection.vue';

interface SectionEntry {
  id: string;
  icon: Component | null;
  label: string;
  order: number;
  component: Component;
}

const xbo = useXbo();
const currentWindow = useCurrentWindow();

const sections = computed<SectionEntry[]>(() =>
  [
    { id: 'appearance', icon: markRaw(RiPaletteLine), label: xbo.t('settings.appearance'), order: 10, component: markRaw(AppearanceSection) },
    { id: 'windows', icon: markRaw(RiWindowLine), label: xbo.t('settings.windows'), order: 20, component: markRaw(WindowsSection) },
    { id: 'taskbar', icon: markRaw(RiLayoutBottomLine), label: xbo.t('settings.taskbar'), order: 30, component: markRaw(TaskbarSection) },
    { id: 'keyboard', icon: markRaw(RiKeyboardLine), label: xbo.t('settings.keyboard'), order: 40, component: markRaw(KeyboardSection) },
    { id: 'language', icon: markRaw(RiGlobalLine), label: xbo.t('settings.language'), order: 50, component: markRaw(LanguageSection) },
    ...xbo.settingsSections,
    { id: 'about', icon: markRaw(RiInformationLine), label: xbo.t('settings.about'), order: 1000, component: markRaw(AboutSection) },
  ].sort((a, b) => a.order - b.order),
);

const sectionId = ref(currentWindow.params.value.section ?? 'appearance');
const section = computed(() => sections.value.find((candidate) => candidate.id === sectionId.value) ?? sections.value[0]);

watch(
  () => currentWindow.params.value.section,
  (requested) => {
    if (requested) sectionId.value = requested;
  },
);

watch(sectionId, (id) => currentWindow.setParams({ section: id }));
</script>

<template>
  <div class="xb:flex xb:h-full">
    <nav class="xb:flex xb:w-[200px] xb:shrink-0 xb:flex-col xb:gap-0.5 xb:overflow-y-auto xb:border-r xb:border-hairline xb:bg-chrome xb:p-2" :aria-label="xbo.t('settings.sections')">
      <button
        v-for="entry in sections"
        :key="entry.id"
        type="button"
        class="xb:flex xb:h-8 xb:items-center xb:gap-2 xb:rounded-sm xb:px-2 xb:text-left xb:text-body xb:transition-colors xb:duration-150"
        :class="entry.id === section?.id ? 'xb:bg-primary-soft xb:font-medium xb:text-primary' : 'xb:text-ink xb:hover:bg-hover'"
        :aria-current="entry.id === section?.id ? 'page' : undefined"
        @click="sectionId = entry.id"
      >
        <component :is="entry.icon" v-if="entry.icon" width="15" height="15" aria-hidden="true" />
        <span class="xb:truncate">{{ entry.label }}</span>
      </button>
    </nav>
    <section class="xb:min-w-0 xb:flex-1 xb:overflow-y-auto xb:bg-chrome/40" :aria-label="section?.label">
      <div class="xb:mx-auto xb:max-w-[680px] xb:px-8 xb:py-7">
        <component :is="section.component" v-if="section" />
      </div>
    </section>
  </div>
</template>
