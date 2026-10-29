<script setup lang="ts">
import { inject, nextTick, ref, useId, watch } from 'vue';
import { FocusScope } from 'reka-ui';
import { windowBodyKey } from '../composables';

const isOpen = defineModel<boolean>('open', { default: false });

withDefaults(
  defineProps<{
    title: string;
    width?: string;
  }>(),
  { width: '440px' },
);

const titleId = useId();
const panel = ref<HTMLElement | null>(null);
const windowBody = inject(windowBodyKey, ref(null));

watch(isOpen, async (isNowOpen) => {
  if (!isNowOpen) return;

  await nextTick();
  panel.value?.querySelector<HTMLElement>('input, textarea, select, button')?.focus();
});

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.stopPropagation();
    isOpen.value = false;
  }
}
</script>

<template>
  <Teleport :to="windowBody ?? 'body'" :disabled="!windowBody">
    <Transition name="sheet">
      <div v-if="isOpen" class="scrim" @keydown="onKeydown">
        <FocusScope trapped loop as-child>
          <section ref="panel" class="sheet" role="dialog" aria-modal="true" :aria-labelledby="titleId" :style="{ width: `min(${width}, calc(100% - 24px))` }">
            <h2 :id="titleId" class="xb:px-5 xb:pt-4 xb:text-title xb:font-semibold xb:text-ink">{{ title }}</h2>
            <div class="xb:px-5 xb:py-3">
              <slot />
            </div>
            <footer v-if="$slots.footer" class="xb:flex xb:justify-end xb:gap-2 xb:px-5 xb:pb-4">
              <slot name="footer" />
            </footer>
          </section>
        </FocusScope>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.scrim {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  justify-content: center;
  background: rgb(var(--xbo-shade) / 0.12);
}

.sheet {
  max-height: calc(100% - 24px);
  overflow-y: auto;
  border-radius: 0 0 var(--xbo-radius-lg) var(--xbo-radius-lg);
  background: var(--xbo-window);
  box-shadow: var(--xbo-shadow-popover);
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 160ms var(--xbo-ease-out);
}

.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform 200ms var(--xbo-ease-out);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(-100%);
}
</style>
