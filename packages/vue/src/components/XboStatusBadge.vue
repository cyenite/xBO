<script setup lang="ts">
import { computed } from 'vue';
import { RiAlertLine, RiCheckboxCircleLine, RiErrorWarningLine, RiTimeLine } from '../icons';
import type { StatusTone } from './status';

const props = defineProps<{
  tone: StatusTone;
  label: string;
}>();

const icon = computed(() => {
  switch (props.tone) {
    case 'success':
      return RiCheckboxCircleLine;
    case 'warning':
      return RiAlertLine;
    case 'danger':
      return RiErrorWarningLine;
    default:
      return RiTimeLine;
  }
});
</script>

<template>
  <span class="status-badge" :class="`tone-${tone}`">
    <component :is="icon" width="13" height="13" aria-hidden="true" />
    {{ label }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  height: 20px;
  align-items: center;
  gap: 4px;
  border-radius: var(--xbo-radius-xs);
  padding: 0 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.tone-neutral {
  background: var(--xbo-chrome);
  color: var(--xbo-ink-muted);
}

.tone-info {
  background: var(--xbo-primary-soft);
  color: var(--xbo-primary);
}

.tone-success {
  background: var(--xbo-success-soft);
  color: var(--xbo-success);
}

.tone-warning {
  background: var(--xbo-warning-soft);
  color: var(--xbo-warning);
}

.tone-danger {
  background: var(--xbo-danger-soft);
  color: var(--xbo-danger);
}
</style>
