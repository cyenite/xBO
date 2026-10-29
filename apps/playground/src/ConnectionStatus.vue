<script setup lang="ts">
import { useOnline } from '@vueuse/core';
import { RiWifiLine } from './icons';

const isOnline = useOnline();
</script>

<template>
  <span class="flex h-6 items-center gap-1.5 px-2 text-caption" :class="isOnline ? 'text-ink' : 'text-danger'" :title="isOnline ? 'Online' : 'Offline'">
    <RiWifiLine width="14" height="14" aria-hidden="true" />
    <span>{{ isOnline ? 'Online' : 'Offline' }}</span>
  </span>
</template>
