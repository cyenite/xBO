<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useCurrentWindow, useNotifications, useShortcut } from '@xbo-ui/vue';

const currentWindow = useCurrentWindow();
const notifications = useNotifications();

const initial = typeof currentWindow.window.value?.state.text === 'string' ? currentWindow.window.value.state.text : '';
const saved = ref(initial);
const text = ref(initial);

const isDirty = computed(() => text.value !== saved.value);
const wordCount = computed(() => (text.value.trim() === '' ? 0 : text.value.trim().split(/\s+/).length));

watch(isDirty, (dirty) => currentWindow.setDirty(dirty), { immediate: true });
watch(saved, (value) => {
  currentWindow.setState({ text: value });
  currentWindow.setTitle(value.trim() === '' ? 'Untitled note' : value.trim().split('\n')[0]!.slice(0, 40));
}, { immediate: true });

function save(): void {
  saved.value = text.value;
  notifications.toast({ tone: 'success', title: 'Note saved' });
}

function transform(style: 'upper' | 'lower'): void {
  text.value = style === 'upper' ? text.value.toUpperCase() : text.value.toLowerCase();
}

currentWindow.setMenus([
  {
    id: 'notes:format',
    label: 'Format',
    items: [
      { label: 'Save', shortcut: 'notes:save', run: save },
      { kind: 'separator' },
      { label: 'Upper case', run: () => transform('upper') },
      { label: 'Lower case', run: () => transform('lower') },
    ],
  },
]);

useShortcut('notes:save', save, { label: 'Save the focused note', binding: 'Mod+S', scope: 'window' });
</script>

<template>
  <div class="flex h-full flex-col">
    <textarea
      v-model="text"
      class="min-h-0 flex-1 resize-none bg-window p-4 font-mono text-body text-ink outline-none"
      placeholder="Write something, then try closing the window before saving."
      aria-label="Note"
    />
    <footer class="flex items-center justify-between border-t border-hairline bg-chrome px-3 py-1.5 text-caption text-ink-muted">
      <span class="xbo-figures">{{ wordCount }} words</span>
      <span>{{ isDirty ? 'Unsaved changes' : 'Saved' }}</span>
    </footer>
  </div>
</template>
