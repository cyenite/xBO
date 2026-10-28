<script setup lang="ts">
import { computed } from 'vue';
import { useIntervalFn, useNow } from '@vueuse/core';

const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 15_000) });

const dateLabel = computed(() => new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' }).format(now.value));
const timeLabel = computed(() => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(now.value));
const fullLabel = computed(() => new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'short' }).format(now.value));
</script>

<template>
  <time class="figures flex h-6 items-center gap-2 px-2 text-caption text-ink" :datetime="now.toISOString()" :title="fullLabel">
    <span>{{ dateLabel }}</span>
    <span class="font-medium">{{ timeLabel }}</span>
  </time>
</template>
