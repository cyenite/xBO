<script setup lang="ts">
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui';
import { useXbo } from '../composables';
import { RiCloseLine } from '../icons';

const isOpen = defineModel<boolean>('open', { default: false });

withDefaults(
  defineProps<{
    title: string;
    width?: string;
    description?: string;
  }>(),
  { width: '480px', description: '' },
);

const xbo = useXbo();
</script>

<template>
  <DialogRoot v-model:open="isOpen">
    <DialogPortal :to="xbo.ui.portalTarget ?? 'body'">
      <DialogOverlay class="overlay" />
      <DialogContent class="dialog" :style="{ width: `min(${width}, calc(100% - 32px))` }">
        <header class="xb:flex xb:items-start xb:gap-3 xb:px-5 xb:pt-4">
          <div class="xb:min-w-0 xb:flex-1">
            <DialogTitle class="xb:text-title xb:font-semibold xb:text-ink">{{ title }}</DialogTitle>
            <DialogDescription v-if="description" class="xb:mt-1 xb:text-body xb:text-ink-muted">{{ description }}</DialogDescription>
          </div>
          <DialogClose class="xbo-button is-plain is-icon is-small" aria-label="Close"><RiCloseLine width="15" height="15" aria-hidden="true" /></DialogClose>
        </header>
        <div class="xb:min-h-0 xb:flex-1 xb:overflow-y-auto xb:px-5 xb:py-4">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="xb:flex xb:justify-end xb:gap-2 xb:border-t xb:border-hairline xb:bg-chrome xb:px-5 xb:py-3">
          <slot name="footer" />
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  z-index: var(--xbo-z-dialog);
  background: rgb(var(--xbo-shade) / 0.24);
  animation: fade-in 160ms var(--xbo-ease-out);
}

.dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: var(--xbo-z-dialog);
  display: flex;
  max-height: calc(100% - 64px);
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--xbo-radius-lg);
  background: var(--xbo-window);
  box-shadow: var(--xbo-shadow-popover);
  color: var(--xbo-ink);
  font-size: calc(13px * var(--xbo-text-scale));
  transform: translate(-50%, -50%);
  animation: dialog-in 200ms var(--xbo-ease-out);
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

@keyframes dialog-in {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.97);
  }
}
</style>
