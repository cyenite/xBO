<script setup lang="ts">
import type { Component } from 'vue';
import XboSpinner from './XboSpinner.vue';

withDefaults(
  defineProps<{
    icon?: Component;
    size?: 'small' | 'medium' | 'large';
    type?: 'button' | 'submit' | 'reset';
    variant?: 'secondary' | 'primary' | 'plain' | 'danger';
    isLoading?: boolean;
    isDisabled?: boolean;
  }>(),
  { icon: undefined, size: 'medium', type: 'button', variant: 'secondary', isLoading: false, isDisabled: false },
);
</script>

<template>
  <button
    :type="type"
    class="xbo-button"
    :class="[`is-${variant}`, `is-${size}`]"
    :disabled="isDisabled || isLoading"
    :aria-busy="isLoading || undefined"
  >
    <XboSpinner v-if="isLoading" :size="14" />
    <component :is="icon" v-else-if="icon" width="15" height="15" aria-hidden="true" />
    <slot />
  </button>
</template>
