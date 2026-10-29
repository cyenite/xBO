<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    width?: string;
    subtitle?: string;
  }>(),
  { title: '', width: '320px', subtitle: '' },
);
</script>

<template>
  <aside class="inspector" :style="{ width }" :aria-label="title || undefined">
    <header v-if="title || $slots.header" class="xb:border-b xb:border-hairline xb:px-5 xb:py-4">
      <slot name="header">
        <h3 class="xbo-selectable xb:text-headline xb:font-semibold xb:text-ink">{{ title }}</h3>
        <p v-if="subtitle" class="xb:mt-0.5 xb:text-body xb:text-ink-muted">{{ subtitle }}</p>
      </slot>
    </header>
    <div class="xb:min-h-0 xb:flex-1 xb:overflow-y-auto xb:px-5 xb:py-4">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="xb:border-t xb:border-hairline xb:bg-chrome xb:px-5 xb:py-3">
      <slot name="footer" />
    </footer>
  </aside>
</template>

<style scoped>
.inspector {
  display: flex;
  height: 100%;
  flex-shrink: 0;
  flex-direction: column;
  border-left: 1px solid var(--xbo-hairline);
  background: var(--xbo-window);
}
</style>
