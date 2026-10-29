<script setup lang="ts">
import { computed } from 'vue';
import type { PreferenceKey } from '@xbo-ui/core';
import XboSwitch from '../../components/XboSwitch.vue';
import { useXbo } from '../../composables';
import type { MessageKey } from '../../i18n';
import SettingRow from './SettingRow.vue';

type BooleanPreference = {
  [K in PreferenceKey]: K extends `is${string}` ? K : never;
}[PreferenceKey];

const props = withDefaults(
  defineProps<{
    hint?: MessageKey;
    label: MessageKey;
    preference: BooleanPreference;
  }>(),
  { hint: undefined },
);

const xbo = useXbo();

const isLocked = computed(() => xbo.lockedKeys.has(props.preference));
const value = computed({
  get: () => xbo.preferences[props.preference],
  set: (next: boolean) => void xbo.setPreference(props.preference, next),
});
</script>

<template>
  <SettingRow v-if="!xbo.hiddenKeys.has(preference)" :label="xbo.t(label)" :hint="hint ? xbo.t(hint) : ''" :is-locked="isLocked">
    <XboSwitch v-model="value" :label="xbo.t(label)" :is-disabled="isLocked" />
  </SettingRow>
</template>
