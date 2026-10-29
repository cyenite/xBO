<script setup lang="ts">
import { computed } from 'vue';
import { useXbo } from '../composables';
import { RiAppsLine } from '../icons';

const xbo = useXbo();

const ordered = computed(() => (xbo.ui.isSwitcherOpen ? xbo.windows.byRecency() : []));
</script>

<template>
  <Transition name="switcher">
    <div v-if="xbo.ui.isSwitcherOpen" class="xb:pointer-events-none xb:absolute xb:inset-0 xb:grid xb:place-items-center" :style="{ zIndex: 'var(--xbo-z-palette)' }">
      <ul
        class="xbo-material xb:flex xb:max-w-[calc(100%-48px)] xb:flex-wrap xb:justify-center xb:gap-2 xb:rounded-xl xb:p-3 xb:shadow-popover"
        role="listbox"
        :aria-label="xbo.t('switcher.label')"
      >
        <li
          v-for="(openWindow, index) in ordered"
          :key="openWindow.id"
          role="option"
          :aria-selected="index === xbo.ui.switcherIndex"
          class="switcher-item xb:flex xb:w-[120px] xb:flex-col xb:items-center xb:gap-2 xb:rounded-lg xb:p-3"
          :class="{ 'is-active': index === xbo.ui.switcherIndex }"
        >
          <span class="xb:grid xb:size-12 xb:place-items-center xb:rounded-md xb:bg-window xb:ring-1 xb:ring-hairline">
            <component :is="xbo.findApp(openWindow.appId)?.icon ?? RiAppsLine" width="24" height="24" class="xb:text-primary" aria-hidden="true" />
          </span>
          <span class="xb:w-full xb:truncate xb:text-center xb:text-caption xb:text-ink">{{ openWindow.title }}</span>
        </li>
      </ul>
    </div>
  </Transition>
</template>

<style scoped>
.switcher-item.is-active {
  background: var(--xbo-primary-soft);
  box-shadow: inset 0 0 0 2px var(--xbo-primary);
}

.switcher-enter-active,
.switcher-leave-active {
  transition: opacity 120ms linear;
}

.switcher-enter-from,
.switcher-leave-to {
  opacity: 0;
}
</style>
