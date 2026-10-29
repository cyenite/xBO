<script setup lang="ts">
import { computed } from 'vue';
import { optionsFor, type PreferenceKey } from '@xbo-ui/core';
import XboSegmentedControl from '../../components/XboSegmentedControl.vue';
import { useXbo } from '../../composables';
import type { MessageKey } from '../../i18n';
import SettingRow from './SettingRow.vue';

const props = withDefaults(
  defineProps<{
    hint?: MessageKey;
    label: MessageKey;
    preference: PreferenceKey;
  }>(),
  { hint: undefined },
);

const xbo = useXbo();

const options = computed(() => optionsFor(props.preference) ?? []);
const isLocked = computed(() => xbo.lockedKeys.has(props.preference));
const value = computed({
  get: () => String(xbo.preferences[props.preference]),
  set: (next: string) => void xbo.setPreference(props.preference, next as never),
});
</script>

<template>
  <SettingRow v-if="!xbo.hiddenKeys.has(preference)" :label="xbo.t(label)" :hint="hint ? xbo.t(hint) : ''" :is-locked="isLocked">
    <XboSegmentedControl v-model="value" :label="xbo.t(label)" :options="options" :is-disabled="isLocked" />
  </SettingRow>
</template>
