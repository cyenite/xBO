<script setup lang="ts">
import { useXbo } from '../../composables';
import PreferenceChoice from './PreferenceChoice.vue';
import PreferenceSwitch from './PreferenceSwitch.vue';
import SettingGroup from './SettingGroup.vue';

const xbo = useXbo();
</script>

<template>
  <div class="xb:flex xb:flex-col xb:gap-6">
    <SettingGroup v-if="xbo.shell.hasTaskbar" :title="xbo.t('taskbar.label')">
      <PreferenceChoice preference="taskbarPosition" label="settings.taskbarPosition" />
      <PreferenceChoice preference="taskbarAlignment" label="settings.taskbarAlignment" />
      <PreferenceSwitch preference="isTaskbarAutoHidden" label="settings.taskbarAutoHide" hint="settings.taskbarAutoHide.hint" />
    </SettingGroup>

    <SettingGroup :title="xbo.t('settings.taskbar')">
      <PreferenceChoice v-if="xbo.shell.hasMenuBar" preference="clock" label="settings.clock" />
      <PreferenceSwitch v-if="xbo.shell.hasNotifications" preference="isDoNotDisturbOn" label="settings.doNotDisturb" hint="settings.doNotDisturb.hint" />
    </SettingGroup>
  </div>
</template>
