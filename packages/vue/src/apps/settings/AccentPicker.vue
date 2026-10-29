<script setup lang="ts">
import { computed } from 'vue';
import { accentOptions, createTheme, type AccentPreference } from '@xbo-ui/core';
import { useXbo } from '../../composables';
import { RiCheckLine } from '../../icons';

const xbo = useXbo();

const isLocked = computed(() => xbo.lockedKeys.has('accent'));
const swatches = computed(() =>
  accentOptions.map((option) => {
    const theme = option.value === 'brand' ? createTheme(xbo.config.theme ?? {}) : createTheme({ preset: option.value });

    return { ...option, color: (xbo.isDark.value ? theme.dark : theme.light).primary };
  }),
);

function choose(value: AccentPreference): void {
  xbo.setPreference('accent', value);
}
</script>

<template>
  <div class="xb:flex xb:flex-wrap xb:gap-2" role="radiogroup" :aria-label="xbo.t('settings.accent')">
    <button
      v-for="swatch in swatches"
      :key="swatch.value"
      type="button"
      role="radio"
      class="swatch"
      :style="{ background: swatch.color }"
      :aria-checked="xbo.preferences.accent === swatch.value"
      :aria-label="swatch.value === 'brand' ? `${swatch.label} (${xbo.brand.name})` : swatch.label"
      :title="swatch.value === 'brand' ? `${swatch.label} (${xbo.brand.name})` : swatch.label"
      :disabled="isLocked"
      @click="choose(swatch.value)"
    >
      <RiCheckLine v-if="xbo.preferences.accent === swatch.value" width="14" height="14" class="xb:text-on-primary" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.swatch {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgb(var(--xbo-shade) / 0.18);
}

.swatch[aria-checked='true'] {
  outline: 2px solid var(--xbo-ink);
  outline-offset: 2px;
}

.swatch:disabled {
  opacity: 0.5;
}
</style>
