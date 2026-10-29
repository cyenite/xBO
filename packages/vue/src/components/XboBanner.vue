<script setup lang="ts">
import { computed } from 'vue';
import { RiAlertLine, RiCheckboxCircleLine, RiCloseLine, RiErrorWarningLine, RiInformationLine } from '../icons';
import type { StatusTone } from './status';

const props = withDefaults(
  defineProps<{
    tone?: StatusTone;
    title: string;
    isDismissible?: boolean;
  }>(),
  { tone: 'info', isDismissible: false },
);

const emit = defineEmits<{
  dismiss: [];
}>();

const icon = computed(() => ({ success: RiCheckboxCircleLine, warning: RiAlertLine, danger: RiErrorWarningLine, info: RiInformationLine, neutral: RiInformationLine })[props.tone]);
</script>

<template>
  <div class="banner" :class="`tone-${tone}`" :role="tone === 'danger' ? 'alert' : 'status'">
    <component :is="icon" width="16" height="16" class="tone-icon xb:mt-px" aria-hidden="true" />
    <div class="xb:flex xb:min-w-0 xb:flex-1 xb:flex-col xb:gap-0.5">
      <p class="xb:text-body xb:font-semibold xb:text-ink">{{ title }}</p>
      <div v-if="$slots.default" class="xb:text-body xb:text-ink-muted"><slot /></div>
      <div v-if="$slots.actions" class="xb:mt-2 xb:flex xb:flex-wrap xb:gap-2"><slot name="actions" /></div>
    </div>
    <button v-if="isDismissible" type="button" class="xbo-button is-plain is-icon is-small" aria-label="Dismiss" @click="emit('dismiss')">
      <RiCloseLine width="14" height="14" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.banner {
  display: flex;
  gap: 10px;
  border-radius: var(--xbo-radius-md);
  padding: 10px 12px;
}

.tone-info,
.tone-neutral {
  background: var(--xbo-primary-soft);
}

.tone-info .tone-icon,
.tone-neutral .tone-icon {
  color: var(--xbo-primary);
}

.tone-success {
  background: var(--xbo-success-soft);
}

.tone-success .tone-icon {
  color: var(--xbo-success);
}

.tone-warning {
  background: var(--xbo-warning-soft);
}

.tone-warning .tone-icon {
  color: var(--xbo-warning);
}

.tone-danger {
  background: var(--xbo-danger-soft);
}

.tone-danger .tone-icon {
  color: var(--xbo-danger);
}
</style>
