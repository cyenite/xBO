<script setup lang="ts">
import { provide } from 'vue';
import { appContentKey } from '../composables';

provide(appContentKey, true);
</script>

<template>
  <div class="xbo-app-content xb:contents">
    <slot />
  </div>
</template>
