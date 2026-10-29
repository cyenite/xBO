<script setup lang="ts">
import { useDialog, useXbo } from '../../composables';
import AboutSummary from '../AboutSummary.vue';

const xbo = useXbo();
const dialog = useDialog();

async function resetAll(): Promise<void> {
  const isConfirmed = await dialog.confirm({ tone: 'danger', title: xbo.t('settings.reset'), confirmLabel: xbo.t('settings.reset') });

  if (isConfirmed) xbo.resetPreferences();
}
</script>

<template>
  <div class="xb:flex xb:flex-col xb:items-start xb:gap-6">
    <AboutSummary class="xb:w-full xb:rounded-md xb:bg-window xb:py-6 xb:ring-1 xb:ring-hairline" />
    <button
      type="button"
      class="xb:rounded-sm xb:bg-chrome xb:px-3 xb:py-1 xb:text-body xb:font-medium xb:text-danger xb:ring-1 xb:ring-field-border xb:hover:bg-hover"
      @click="resetAll"
    >
      {{ xbo.t('settings.reset') }}
    </button>
  </div>
</template>
