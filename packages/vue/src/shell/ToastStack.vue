<script setup lang="ts">
import { useXbo } from '../composables';
import type { XboNotification } from '../instance';
import NotificationCard from './NotificationCard.vue';

const xbo = useXbo();

function runAction(toastId: string, notification: XboNotification, index: number): void {
  notification.actions[index]?.run();
  notification.isRead = true;
  xbo.dismissToast(toastId);
}
</script>

<template>
  <section
    class="xb:pointer-events-none xb:absolute xb:top-10 xb:right-3 xb:flex xb:w-[min(360px,calc(100%-24px))] xb:flex-col xb:gap-2"
    :style="{ zIndex: 'var(--xbo-z-toast)' }"
    aria-live="polite"
    :aria-label="xbo.t('notifications.title')"
  >
    <TransitionGroup name="toast">
      <NotificationCard
        v-for="toast in xbo.toasts"
        :key="toast.id"
        class="xb:pointer-events-auto xb:shadow-popover"
        :notification="toast.notification"
        @dismiss="xbo.dismissToast(toast.id)"
        @action="(index) => runAction(toast.id, toast.notification, index)"
      />
    </TransitionGroup>
  </section>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 180ms var(--xbo-ease-out),
    transform 220ms var(--xbo-ease-out);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>
