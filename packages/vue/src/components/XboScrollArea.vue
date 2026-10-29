<script setup lang="ts">
import { ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from 'reka-ui';
</script>

<template>
  <ScrollAreaRoot class="scroll-area" type="hover">
    <ScrollAreaViewport class="xb:h-full xb:w-full">
      <slot />
    </ScrollAreaViewport>
    <ScrollAreaScrollbar orientation="vertical" class="scrollbar">
      <ScrollAreaThumb class="thumb" />
    </ScrollAreaScrollbar>
    <ScrollAreaScrollbar orientation="horizontal" class="scrollbar is-horizontal">
      <ScrollAreaThumb class="thumb" />
    </ScrollAreaScrollbar>
  </ScrollAreaRoot>
</template>

<style scoped>
.scroll-area {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.scrollbar {
  display: flex;
  width: 10px;
  padding: 2px;
  touch-action: none;
  user-select: none;
}

.scrollbar.is-horizontal {
  width: auto;
  height: 10px;
  flex-direction: column;
}

.thumb {
  position: relative;
  flex: 1;
  border-radius: 999px;
  background: color-mix(in oklch, var(--xbo-ink-subtle) 55%, transparent);
}

.thumb:hover {
  background: var(--xbo-ink-subtle);
}
</style>
