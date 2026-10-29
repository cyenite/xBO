<script setup lang="ts">
import type { Component } from 'vue';

withDefaults(
  defineProps<{
    icon: Component;
    label: string;
    size?: 'small' | 'medium' | 'large';
    variant?: 'plain' | 'secondary' | 'primary';
    isPressed?: boolean | null;
    isDisabled?: boolean;
  }>(),
  { size: 'medium', variant: 'plain', isPressed: null, isDisabled: false },
);
</script>

<template>
  <button
    type="button"
    class="xbo-button is-icon"
    :class="[`is-${variant}`, `is-${size}`]"
    :aria-label="label"
    :title="label"
    :aria-pressed="isPressed ?? undefined"
    :disabled="isDisabled"
  >
    <component :is="icon" :width="size === 'small' ? 14 : 16" :height="size === 'small' ? 14 : 16" aria-hidden="true" />
  </button>
</template>
