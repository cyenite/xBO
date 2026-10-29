<script setup lang="ts">
import { XboSwitch, useAppPreference } from '@xbo-ui/vue';

const isTipsShown = useAppPreference('playground.isTipsShown', true);
</script>

<template>
  <section class="flex flex-col gap-3">
    <h3 class="text-title font-semibold text-ink">Playground</h3>
    <p class="text-body text-ink-muted">Apps add their own sections with <code class="font-mono">settingsSections</code> and keep their own values with <code class="font-mono">useAppPreference()</code>.</p>
    <label class="flex items-center justify-between rounded-md bg-window px-4 py-3 text-body text-ink ring-1 ring-hairline">
      Show tips in the welcome window
      <XboSwitch v-model="isTipsShown" label="Show tips in the welcome window" />
    </label>
  </section>
</template>
