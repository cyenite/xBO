<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Wallpaper } from '@xbo-ui/core';
import { useXbo } from '../../composables';
import { RiCheckLine } from '../../icons';

const xbo = useXbo();
const imageUrl = ref(xbo.preferences.wallpaper.kind === 'image' ? xbo.preferences.wallpaper.value : '');

const isLocked = computed(() => xbo.lockedKeys.has('wallpaper'));
const choices = computed(() => [
  { id: 'tint', label: xbo.t('settings.wallpaper.tint'), wallpaper: { kind: 'tint', value: '' } as Wallpaper, preview: 'var(--xbo-desktop)' },
  ...xbo.wallpapers.map((option) => ({ id: option.id, label: option.label, wallpaper: { kind: option.kind, value: option.value } as Wallpaper, preview: option.kind === 'image' ? `url("${option.value}") center / cover` : option.value })),
]);

function isCurrent(wallpaper: Wallpaper): boolean {
  return xbo.preferences.wallpaper.kind === wallpaper.kind && xbo.preferences.wallpaper.value === wallpaper.value;
}

function useImage(): void {
  const value = imageUrl.value.trim();

  if (value !== '') xbo.setPreference('wallpaper', { kind: 'image', value });
}
</script>

<template>
  <div class="xb:flex xb:flex-col xb:gap-3">
    <div class="xb:flex xb:flex-wrap xb:gap-2" role="radiogroup" :aria-label="xbo.t('settings.wallpaper')">
      <button
        v-for="choice in choices"
        :key="choice.id"
        type="button"
        role="radio"
        class="wallpaper xb:grid xb:place-items-center"
        :style="{ background: choice.preview }"
        :aria-checked="isCurrent(choice.wallpaper)"
        :aria-label="choice.label"
        :title="choice.label"
        :disabled="isLocked"
        @click="xbo.setPreference('wallpaper', choice.wallpaper)"
      >
        <span v-if="isCurrent(choice.wallpaper)" class="xb:grid xb:size-5 xb:place-items-center xb:rounded-full xb:bg-window xb:shadow-popover">
          <RiCheckLine width="12" height="12" class="xb:text-ink" aria-hidden="true" />
        </span>
      </button>
    </div>
    <form class="xb:flex xb:gap-2" @submit.prevent="useImage">
      <input
        v-model="imageUrl"
        type="url"
        class="xb:h-7 xb:min-w-0 xb:flex-1 xb:rounded-sm xb:bg-window xb:px-2 xb:text-body xb:text-ink xb:ring-1 xb:ring-field-border xb:outline-none xb:focus:ring-2 xb:focus:ring-primary"
        :placeholder="xbo.t('settings.wallpaper.custom')"
        :aria-label="xbo.t('settings.wallpaper.custom')"
        :disabled="isLocked"
      />
      <button type="submit" class="xb:h-7 xb:rounded-sm xb:bg-chrome xb:px-3 xb:text-body xb:font-medium xb:text-ink xb:ring-1 xb:ring-field-border xb:hover:bg-hover" :disabled="isLocked">
        {{ xbo.t('settings.wallpaper.apply') }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.wallpaper {
  width: 64px;
  height: 40px;
  border-radius: var(--xbo-radius-sm);
  background-size: cover;
  box-shadow: inset 0 0 0 1px rgb(var(--xbo-shade) / 0.18);
}

.wallpaper[aria-checked='true'] {
  outline: 2px solid var(--xbo-primary);
  outline-offset: 2px;
}

.wallpaper:disabled {
  opacity: 0.5;
}
</style>
