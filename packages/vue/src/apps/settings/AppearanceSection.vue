<script setup lang="ts">
import { useXbo } from '../../composables';
import AccentPicker from './AccentPicker.vue';
import PreferenceChoice from './PreferenceChoice.vue';
import SettingGroup from './SettingGroup.vue';
import SettingRow from './SettingRow.vue';
import WallpaperPicker from './WallpaperPicker.vue';

const xbo = useXbo();
</script>

<template>
  <div class="xb:flex xb:flex-col xb:gap-6">
    <SettingGroup :title="xbo.t('settings.appearance')">
      <PreferenceChoice preference="appearance" label="settings.theme" hint="settings.theme.hint" />
      <SettingRow v-if="!xbo.hiddenKeys.has('accent')" :label="xbo.t('settings.accent')" :hint="xbo.t('settings.accent.hint')" :is-locked="xbo.lockedKeys.has('accent')">
        <AccentPicker />
      </SettingRow>
      <PreferenceChoice preference="contrast" label="settings.contrast" hint="settings.contrast.hint" />
      <PreferenceChoice preference="transparency" label="settings.transparency" hint="settings.transparency.hint" />
      <PreferenceChoice preference="motion" label="settings.motion" hint="settings.motion.hint" />
    </SettingGroup>

    <SettingGroup :title="xbo.t('settings.density')">
      <PreferenceChoice preference="density" label="settings.density" hint="settings.density.hint" />
      <PreferenceChoice preference="textScale" label="settings.textScale" hint="settings.textScale.hint" />
      <PreferenceChoice v-if="typeof xbo.config.theme?.radius !== 'object'" preference="radius" label="settings.radius" hint="settings.radius.hint" />
    </SettingGroup>

    <SettingGroup v-if="!xbo.hiddenKeys.has('wallpaper')" :title="xbo.t('settings.wallpaper')">
      <SettingRow :label="xbo.t('settings.wallpaper')" :hint="xbo.t('settings.wallpaper.hint')" :is-locked="xbo.lockedKeys.has('wallpaper')">
        <WallpaperPicker />
      </SettingRow>
    </SettingGroup>
  </div>
</template>
