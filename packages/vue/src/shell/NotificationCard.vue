<script setup lang="ts">
import { computed } from 'vue';
import { useFormat, useXbo } from '../composables';
import type { XboNotification } from '../instance';
import { RiCheckboxCircleLine, RiCloseLine, RiErrorWarningLine, RiInformationLine, RiAlertLine } from '../icons';

const props = defineProps<{
  notification: XboNotification;
}>();

const emit = defineEmits<{
  dismiss: [];
  action: [index: number];
}>();

const xbo = useXbo();
const format = useFormat();

const toneIcon = computed(() => {
  switch (props.notification.tone) {
    case 'success':
      return RiCheckboxCircleLine;
    case 'warning':
      return RiAlertLine;
    case 'danger':
      return RiErrorWarningLine;
    default:
      return RiInformationLine;
  }
});
const appLabel = computed(() => (props.notification.appId ? xbo.findApp(props.notification.appId)?.label : undefined));
const timeLabel = computed(() => format.time(props.notification.createdAt));
</script>

<template>
  <article class="notification-card xb:flex xb:gap-3 xb:rounded-lg xb:bg-window xb:p-3 xb:ring-1 xb:ring-hairline" :class="`tone-${notification.tone}`">
    <component :is="notification.icon ?? toneIcon" width="18" height="18" class="tone-icon xb:mt-0.5" aria-hidden="true" />
    <div class="xb:flex xb:min-w-0 xb:flex-1 xb:flex-col xb:gap-0.5">
      <p class="xb:flex xb:items-baseline xb:gap-2 xb:text-caption xb:text-ink-subtle">
        <span v-if="appLabel" class="xb:truncate">{{ appLabel }}</span>
        <time class="xbo-figures xb:ml-auto xb:shrink-0" :datetime="new Date(notification.createdAt).toISOString()">{{ timeLabel }}</time>
      </p>
      <h3 class="xb:text-body xb:font-semibold xb:text-ink">{{ notification.title }}</h3>
      <p v-if="notification.body" class="xb:text-body xb:text-ink-muted">{{ notification.body }}</p>
      <div v-if="notification.actions.length > 0" class="xb:mt-2 xb:flex xb:flex-wrap xb:gap-2">
        <button v-for="(action, index) in notification.actions" :key="action.label" type="button" class="action-button" @click="emit('action', index)">
          {{ action.label }}
        </button>
      </div>
    </div>
    <button type="button" class="dismiss-button" :aria-label="`${xbo.t('notifications.dismiss')}: ${notification.title}`" @click="emit('dismiss')">
      <RiCloseLine width="14" height="14" aria-hidden="true" />
    </button>
  </article>
</template>

<style scoped>
.tone-info .tone-icon,
.tone-neutral .tone-icon {
  color: var(--xbo-primary);
}

.tone-success .tone-icon {
  color: var(--xbo-success);
}

.tone-warning .tone-icon {
  color: var(--xbo-warning);
}

.tone-danger .tone-icon {
  color: var(--xbo-danger);
}

.action-button {
  height: 24px;
  border-radius: var(--xbo-radius-sm);
  padding: 0 10px;
  background: var(--xbo-chrome);
  box-shadow: inset 0 0 0 1px var(--xbo-hairline);
  color: var(--xbo-ink);
  font-size: calc(12px * var(--xbo-text-scale));
  font-weight: 500;
}

.action-button:hover {
  background: var(--xbo-hover);
}

.dismiss-button {
  display: grid;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  place-items: center;
  border-radius: var(--xbo-radius-xs);
  color: var(--xbo-ink-muted);
}

.dismiss-button:hover {
  background: var(--xbo-hover);
  color: var(--xbo-ink);
}
</style>
