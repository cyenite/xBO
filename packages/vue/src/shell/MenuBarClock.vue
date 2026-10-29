<script setup lang="ts">
import { computed } from 'vue';
import { useIntervalFn, useNow } from '@vueuse/core';
import { useFormat, useXbo } from '../composables';

const xbo = useXbo();
const format = useFormat();
const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 15_000) });

const isDateShown = computed(() => xbo.preferences.clock === 'date-time');
const dateLabel = computed(() => format.date(now.value, { weekday: 'short', day: 'numeric', month: 'short' }));
const timeLabel = computed(() => format.time(now.value, { hour: '2-digit', minute: '2-digit' }));
const fullLabel = computed(() => format.date(now.value, { dateStyle: 'full', timeStyle: 'short' }));
</script>

<template>
  <time class="xbo-figures xb:flex xb:h-6 xb:items-center xb:gap-2 xb:px-2 xb:text-caption xb:text-ink" :datetime="now.toISOString()" :title="fullLabel">
    <span v-if="isDateShown">{{ dateLabel }}</span>
    <span class="xb:font-medium">{{ timeLabel }}</span>
  </time>
</template>
