<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    name: string;
    size?: number;
    imageUrl?: string;
  }>(),
  { size: 28, imageUrl: '' },
);

const hasImageFailed = ref(false);

const initials = computed(() =>
  props.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join(''),
);
const hue = computed(() => [...props.name].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 360);

watch(() => props.imageUrl, () => (hasImageFailed.value = false));
</script>

<template>
  <span class="avatar" :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.4)}px`, '--avatar-hue': hue }" role="img" :aria-label="name">
    <img v-if="imageUrl && !hasImageFailed" :src="imageUrl" alt="" @error="hasImageFailed = true" />
    <span v-else aria-hidden="true">{{ initials }}</span>
  </span>
</template>

<style scoped>
.avatar {
  display: inline-grid;
  flex-shrink: 0;
  place-items: center;
  overflow: hidden;
  border-radius: 999px;
  background: oklch(0.9 0.05 var(--avatar-hue));
  color: oklch(0.35 0.08 var(--avatar-hue));
  font-weight: 600;
}

:where([data-xbo-mode='dark']) .avatar {
  background: oklch(0.36 0.06 var(--avatar-hue));
  color: oklch(0.92 0.04 var(--avatar-hue));
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
