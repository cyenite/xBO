<script setup lang="ts">
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from 'reka-ui';
import { RiArrowRightSLine } from '../icons';

const isOpen = defineModel<boolean>('open', { default: false });

defineProps<{
  title: string;
}>();
</script>

<template>
  <CollapsibleRoot v-model:open="isOpen" class="disclosure">
    <CollapsibleTrigger class="trigger">
      <RiArrowRightSLine width="14" height="14" class="chevron" :class="{ 'is-open': isOpen }" aria-hidden="true" />
      <span class="xb:text-body xb:font-semibold xb:text-ink">{{ title }}</span>
      <span class="xb:ml-auto"><slot name="trailing" /></span>
    </CollapsibleTrigger>
    <CollapsibleContent class="content">
      <div class="xb:pt-2 xb:pb-1 xb:pl-5">
        <slot />
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<style scoped>
.trigger {
  display: flex;
  width: 100%;
  height: 28px;
  align-items: center;
  gap: 6px;
  border-radius: var(--xbo-radius-sm);
  text-align: left;
}

.chevron {
  color: var(--xbo-ink-muted);
  transition: transform 140ms var(--xbo-ease-out);
}

.chevron.is-open {
  transform: rotate(90deg);
}

.content {
  overflow: hidden;
}

.content[data-state='open'] {
  animation: disclosure-open 180ms var(--xbo-ease-out);
}

.content[data-state='closed'] {
  animation: disclosure-close 140ms var(--xbo-ease-out);
}

@keyframes disclosure-open {
  from {
    height: 0;
  }

  to {
    height: var(--reka-collapsible-content-height);
  }
}

@keyframes disclosure-close {
  from {
    height: var(--reka-collapsible-content-height);
  }

  to {
    height: 0;
  }
}
</style>
