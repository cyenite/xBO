<script setup lang="ts">
import { computed } from 'vue';
import { useFormat, useXbo } from '../../composables';
import PreferenceChoice from './PreferenceChoice.vue';
import SettingGroup from './SettingGroup.vue';
import SettingRow from './SettingRow.vue';

const xbo = useXbo();
const format = useFormat();
const previewDate = new Date();

const isLocked = computed(() => xbo.lockedKeys.has('locale'));
const locales = computed(() => [{ value: '', label: xbo.t('settings.locale.system') }, ...(xbo.config.i18n?.locales ?? []).map(({ value, label }) => ({ value, label }))]);
const preview = computed(() => `${format.date(previewDate, { dateStyle: 'full' })}, ${format.time(previewDate)}  ·  ${format.number(1234567.89, { minimumFractionDigits: 2 })}`);
</script>

<template>
  <div class="xb:flex xb:flex-col xb:gap-6">
    <SettingGroup :title="xbo.t('settings.language')">
      <SettingRow v-if="!xbo.hiddenKeys.has('locale') && locales.length > 1" :label="xbo.t('settings.locale')" :is-locked="isLocked">
        <select
          class="xb:h-7 xb:rounded-sm xb:bg-window xb:px-2 xb:text-body xb:text-ink xb:ring-1 xb:ring-field-border xb:outline-none xb:focus:ring-2 xb:focus:ring-primary"
          :value="xbo.preferences.locale"
          :disabled="isLocked"
          :aria-label="xbo.t('settings.locale')"
          @change="xbo.setPreference('locale', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="option in locales" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </SettingRow>
      <PreferenceChoice preference="hourCycle" label="settings.hourCycle" />
      <SettingRow :label="xbo.t('settings.preview')">
        <span class="xbo-figures xb:text-body xb:text-ink-muted">{{ preview }}</span>
      </SettingRow>
    </SettingGroup>
  </div>
</template>
