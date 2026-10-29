<script setup lang="ts">
import { useXbo } from '../../composables';
import PreferenceChoice from './PreferenceChoice.vue';
import PreferenceSwitch from './PreferenceSwitch.vue';
import SettingGroup from './SettingGroup.vue';

const xbo = useXbo();
</script>

<template>
  <div class="xb:flex xb:flex-col xb:gap-6">
    <SettingGroup :title="xbo.t('settings.windows')">
      <PreferenceChoice preference="windowChrome" label="settings.windowChrome" hint="settings.windowChrome.hint" />
      <PreferenceSwitch preference="isBoundsMemoryOn" label="settings.boundsMemory" hint="settings.boundsMemory.hint" />
      <PreferenceSwitch
        v-if="xbo.config.startup?.isSessionRestored !== false"
        preference="isSessionRestored"
        label="settings.sessionRestore"
        hint="settings.sessionRestore.hint"
      />
    </SettingGroup>
  </div>
</template>
