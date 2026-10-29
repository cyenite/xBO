<script setup lang="ts">
import SegmentedControl from '../components/SegmentedControl.vue';
import { chromeOptions, densityOptions, themeOptions, transparencyOptions, usePreferencesStore } from '../stores/preferences';

const preferences = usePreferencesStore();
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div class="mx-auto flex max-w-[640px] flex-col gap-6 px-8 py-7">
      <section aria-labelledby="appearance-heading">
        <h3 id="appearance-heading" class="text-title font-semibold text-ink">Appearance</h3>
        <dl class="mt-3 divide-y divide-hairline rounded-md ring-1 ring-hairline">
          <div class="setting-row">
            <dt>
              <span class="text-body text-ink">Theme</span>
              <span class="block text-caption text-ink-muted">Match system follows your computer’s light or dark setting.</span>
            </dt>
            <dd><SegmentedControl v-model="preferences.theme" label="Theme" :options="themeOptions" /></dd>
          </div>
          <div class="setting-row">
            <dt>
              <span class="text-body text-ink">Transparency</span>
              <span class="block text-caption text-ink-muted">Reduce to make the menu bar, taskbar and menus solid.</span>
            </dt>
            <dd><SegmentedControl v-model="preferences.transparency" label="Transparency" :options="transparencyOptions" /></dd>
          </div>
          <div class="setting-row">
            <dt>
              <span class="text-body text-ink">Density</span>
              <span class="block text-caption text-ink-muted">Comfortable gives grid rows more height for touch screens.</span>
            </dt>
            <dd><SegmentedControl v-model="preferences.density" label="Density" :options="densityOptions" /></dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="windows-heading">
        <h3 id="windows-heading" class="text-title font-semibold text-ink">Windows</h3>
        <dl class="mt-3 rounded-md ring-1 ring-hairline">
          <div class="setting-row">
            <dt>
              <span class="text-body text-ink">Window controls</span>
              <span class="block text-caption text-ink-muted">Traffic lights on the left (macOS) or caption buttons on the right (Windows).</span>
            </dt>
            <dd><SegmentedControl v-model="preferences.chrome" label="Window controls" :options="chromeOptions" /></dd>
          </div>
        </dl>
      </section>
    </div>
  </div>
</template>

<style scoped>
.setting-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  padding: 12px 16px;
}

.setting-row dt {
  min-width: 0;
  flex: 1 1 220px;
}
</style>
