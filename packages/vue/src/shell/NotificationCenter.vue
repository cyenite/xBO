<script setup lang="ts">
import { computed, watch } from 'vue';
import { useXbo } from '../composables';
import type { XboNotification } from '../instance';
import NotificationCard from './NotificationCard.vue';

const xbo = useXbo();

const isOpen = computed(() => xbo.ui.isNotificationCenterOpen);

watch(isOpen, (isNowOpen, wasOpen) => {
  if (wasOpen && !isNowOpen) xbo.markAllRead();
});

function close(): void {
  xbo.ui.isNotificationCenterOpen = false;
}

function runAction(notification: XboNotification, index: number): void {
  notification.actions[index]?.run();
  notification.isRead = true;
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    close();
  }
}
</script>

<template>
  <Transition name="center">
    <div v-if="isOpen" class="xb:absolute xb:inset-0" :style="{ zIndex: 'var(--xbo-z-launcher)' }" @pointerdown.self="close" @keydown="onKeydown">
      <aside
        class="center-panel xbo-material xb:absolute xb:top-[38px] xb:right-2 xb:bottom-2 xb:flex xb:w-[min(380px,calc(100%-16px))] xb:flex-col xb:overflow-hidden xb:rounded-xl xb:shadow-popover"
        role="dialog"
        :aria-label="xbo.t('notifications.title')"
      >
        <header class="xb:flex xb:items-center xb:gap-3 xb:border-b xb:border-hairline xb:px-4 xb:py-3">
          <h2 class="xb:flex-1 xb:text-title xb:font-semibold xb:text-ink">{{ xbo.t('notifications.title') }}</h2>
          <label class="xb:flex xb:items-center xb:gap-2 xb:text-caption xb:text-ink-muted">
            <input
              type="checkbox"
              class="xb:size-3.5 xb:accent-primary"
              :checked="xbo.preferences.isDoNotDisturbOn"
              :disabled="xbo.lockedKeys.has('isDoNotDisturbOn')"
              @change="xbo.setPreference('isDoNotDisturbOn', ($event.target as HTMLInputElement).checked)"
            />
            {{ xbo.t('notifications.doNotDisturb') }}
          </label>
          <button
            v-if="xbo.notifications.length > 0"
            type="button"
            class="xb:rounded-xs xb:px-1.5 xb:text-caption xb:font-medium xb:text-primary xb:hover:underline"
            @click="xbo.clearNotifications()"
          >
            {{ xbo.t('notifications.clearAll') }}
          </button>
        </header>
        <div class="xb:min-h-0 xb:flex-1 xb:overflow-y-auto xb:p-3">
          <ul v-if="xbo.notifications.length > 0" class="xb:flex xb:flex-col xb:gap-2">
            <li v-for="notification in xbo.notifications" :key="notification.id" :class="{ 'is-unread': !notification.isRead }">
              <NotificationCard
                :notification="notification"
                @dismiss="xbo.removeNotification(notification.id)"
                @action="(index) => runAction(notification, index)"
              />
            </li>
          </ul>
          <p v-else class="xb:py-12 xb:text-center xb:text-body xb:text-ink-muted">{{ xbo.t('notifications.empty') }}</p>
        </div>
      </aside>
    </div>
  </Transition>
</template>

<style scoped>
.is-unread :deep(h3)::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 6px;
  border-radius: 999px;
  background: var(--xbo-primary);
  vertical-align: 1px;
}

.center-enter-active,
.center-leave-active {
  transition: opacity 160ms var(--xbo-ease-out);
}

.center-enter-active .center-panel,
.center-leave-active .center-panel {
  transition: transform 220ms var(--xbo-ease-out);
}

.center-enter-from,
.center-leave-to {
  opacity: 0;
}

.center-enter-from .center-panel,
.center-leave-to .center-panel {
  transform: translateX(24px);
}
</style>
