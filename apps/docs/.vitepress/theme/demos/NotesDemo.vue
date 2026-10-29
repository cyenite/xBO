<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { XboStatusBar, useCurrentWindow, useShortcut, useNotifications } from '@xbo-ui/vue';

const text = ref('Type here, then close this window before saving.');
const saved = ref(text.value);
const currentWindow = useCurrentWindow();
const notifications = useNotifications();

const isDirty = computed(() => text.value !== saved.value);

watch(isDirty, (dirty) => currentWindow.setDirty(dirty));

function save(): void {
  saved.value = text.value;
  notifications.toast({ tone: 'success', title: 'Saved' });
}

useShortcut('demo:save', save, { label: 'Save note', binding: 'Mod+S', scope: 'window' });
</script>

<template>
  <div style="display: flex; height: 100%; flex-direction: column">
    <textarea v-model="text" aria-label="Note" style="flex: 1; resize: none; padding: 14px; border: 0; outline: none; background: var(--xbo-window); color: var(--xbo-ink); font: inherit" />
    <XboStatusBar>
      <span>{{ isDirty ? 'Unsaved changes' : 'Saved' }}</span>
      <template #trailing><button type="button" class="xbo-button is-small" @click="save">Save</button></template>
    </XboStatusBar>
  </div>
</template>
