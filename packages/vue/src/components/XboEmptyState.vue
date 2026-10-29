<script setup lang="ts">
import type { Component } from 'vue';

withDefaults(
  defineProps<{
    icon?: Component;
    title: string;
    description?: string;
  }>(),
  { icon: undefined, description: '' },
);
</script>

<template>
  <div class="xb:mx-auto xb:flex xb:max-w-[320px] xb:flex-col xb:items-center xb:gap-2 xb:px-6 xb:py-12 xb:text-center">
    <component :is="icon" v-if="icon" width="28" height="28" class="xb:mb-1 xb:text-ink-subtle" aria-hidden="true" />
    <p class="xb:text-body xb:font-medium xb:text-ink">{{ title }}</p>
    <p v-if="description" class="xb:text-caption xb:text-ink-muted">{{ description }}</p>
    <div v-if="$slots.default" class="xb:mt-2 xb:flex xb:flex-wrap xb:justify-center xb:gap-2"><slot /></div>
  </div>
</template>
