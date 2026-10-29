<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <section class="xb:flex xb:flex-col xb:gap-3">
    <h3 class="xb:text-title xb:font-semibold xb:text-ink">{{ title }}</h3>
    <dl class="xb:rounded-md xb:bg-window xb:ring-1 xb:ring-hairline">
      <slot />
    </dl>
  </section>
</template>
