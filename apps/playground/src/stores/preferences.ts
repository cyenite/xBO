import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { usePreferredDark, useMediaQuery } from '@vueuse/core';
import { detectHostOs } from '../legacy';
import { readStored, writeStored } from '../legacy';

export const themeOptions = [
  { value: 'system', label: 'Match system' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

export const chromeOptions = [
  { value: 'auto', label: 'Match my computer' },
  { value: 'macos', label: 'macOS' },
  { value: 'windows', label: 'Windows' },
] as const;

export const transparencyOptions = [
  { value: 'system', label: 'Match system' },
  { value: 'reduced', label: 'Reduce transparency' },
] as const;

export const densityOptions = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
] as const;

export type ThemePreference = (typeof themeOptions)[number]['value'];
export type ChromePreference = (typeof chromeOptions)[number]['value'];
export type TransparencyPreference = (typeof transparencyOptions)[number]['value'];
export type DensityPreference = (typeof densityOptions)[number]['value'];
export type ChromeStyle = Exclude<ChromePreference, 'auto'>;

interface StoredPreferences {
  theme: ThemePreference;
  chrome: ChromePreference;
  density: DensityPreference;
  transparency: TransparencyPreference;
}

const storageKey = 'xbo.preferences';

const defaults: StoredPreferences = {
  theme: 'system',
  chrome: 'auto',
  density: 'compact',
  transparency: 'system',
};

export const usePreferencesStore = defineStore('preferences', () => {
  const stored = { ...defaults, ...readStored<Partial<StoredPreferences>>(storageKey, {}) };

  const theme = ref<ThemePreference>(stored.theme);
  const chrome = ref<ChromePreference>(stored.chrome);
  const density = ref<DensityPreference>(stored.density);
  const transparency = ref<TransparencyPreference>(stored.transparency);

  const prefersDark = usePreferredDark();
  const prefersReducedTransparency = useMediaQuery('(prefers-reduced-transparency: reduce)');

  const isDark = computed(() => theme.value === 'dark' || (theme.value === 'system' && prefersDark.value));
  const chromeStyle = computed<ChromeStyle>(() => {
    if (chrome.value !== 'auto') return chrome.value;

    return detectHostOs() === 'macos' ? 'macos' : 'windows';
  });
  const isTransparencyReduced = computed(() => transparency.value === 'reduced' || prefersReducedTransparency.value);

  watch([theme, chrome, density, transparency], () => {
    writeStored(storageKey, {
      theme: theme.value,
      chrome: chrome.value,
      density: density.value,
      transparency: transparency.value,
    } satisfies StoredPreferences);
  });

  function toggleTheme(): void {
    theme.value = isDark.value ? 'light' : 'dark';
  }

  return { theme, chrome, density, transparency, isDark, chromeStyle, isTransparencyReduced, toggleTheme };
});
