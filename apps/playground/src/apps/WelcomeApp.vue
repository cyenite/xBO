<script setup lang="ts">
import { useCommands, useCurrentWindow, useDialog, useNotifications, usePlatform, useShortcut, useWindows, useXbo } from '@xbo-ui/vue';
import { RiBellLine } from '../icons';

const xbo = useXbo();
const windows = useWindows();
const dialog = useDialog();
const platform = usePlatform();
const commands = useCommands();
const notifications = useNotifications();
const currentWindow = useCurrentWindow();

commands.register({
  id: 'playground:notify',
  icon: RiBellLine,
  label: 'Send a test notification',
  section: 'Playground',
  keywords: ['toast', 'alert'],
  shortcutId: 'playground:notify',
  run: () => sendNotification(),
});

useShortcut('playground:notify', () => sendNotification(), { label: 'Send a test notification', binding: 'Ctrl+Alt+T' });

let sent = 0;

function sendNotification(): void {
  sent += 1;
  currentWindow.setBadge(String(sent));
  notifications.notify({
    tone: sent % 3 === 0 ? 'warning' : 'success',
    title: `Test notification ${sent}`,
    body: 'Notifications also land in the list behind the bell in the menu bar.',
    appId: 'welcome',
    actions: [{ label: 'Open notes', run: () => void windows.open('notes') }],
  });
}

async function askName(): Promise<void> {
  const name = await dialog.prompt({ title: 'What should we call you?', placeholder: 'Your name', confirmLabel: 'Save' });

  if (name) notifications.toast({ tone: 'success', title: `Hello, ${name}` });
}

async function confirmInWindow(): Promise<void> {
  const isConfirmed = await currentWindow.confirm({ title: 'Window-modal sheet', message: 'This question only blocks this window. Other windows keep working.', confirmLabel: 'Got it' });

  notifications.toast({ title: isConfirmed ? 'Confirmed' : 'Cancelled' });
}

function openTiled(): void {
  const notes = windows.open('notes', { isNewWindow: true });
  const files = windows.open('files');

  if (notes) windows.snap(notes.id, 'left');
  if (files) windows.snap(files.id, 'right');
}
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div class="mx-auto flex max-w-[620px] flex-col gap-6 px-8 py-7">
      <header>
        <h2 class="text-display font-semibold text-ink">Welcome to xBO</h2>
        <p class="mt-1 text-body text-ink-muted">
          Everything here is configured in one <code class="font-mono">createXbo()</code> call. Try the keyboard first: {{ xbo.shortcutLabel('palette') }} opens
          the command palette, {{ xbo.shortcutLabel('launcher') }} opens Start and {{ xbo.shortcutLabel('switchWindow') }} switches windows.
        </p>
      </header>

      <section class="flex flex-col gap-2">
        <h3 class="text-title font-semibold text-ink">Windows</h3>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="demo-button" @click="openTiled">Tile notes and files</button>
          <button type="button" class="demo-button" @click="windows.open('notes', { isNewWindow: true })">New note</button>
          <button type="button" class="demo-button" @click="windows.open('files', { params: { folder: 'Reports' } })">Open the Reports folder</button>
          <button type="button" class="demo-button" @click="windows.minimizeAll()">Show desktop</button>
        </div>
      </section>

      <section class="flex flex-col gap-2">
        <h3 class="text-title font-semibold text-ink">Notifications and dialogs</h3>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="demo-button" @click="sendNotification">Send a notification ({{ platform.formatBinding('Ctrl+Alt+T') }})</button>
          <button type="button" class="demo-button" @click="askName">Ask with a prompt</button>
          <button type="button" class="demo-button" @click="confirmInWindow">Window-modal sheet</button>
        </div>
      </section>

      <section class="flex flex-col gap-2">
        <h3 class="text-title font-semibold text-ink">Make it yours</h3>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="demo-button" @click="xbo.openSettings('appearance')">Theme, accent and wallpaper</button>
          <button type="button" class="demo-button" @click="xbo.openSettings('keyboard')">Rebind shortcuts</button>
          <button type="button" class="demo-button" @click="xbo.openSettings('playground')">A section this app added</button>
        </div>
      </section>

      <p class="text-caption text-ink-subtle">Running on {{ platform.osLabel }} in {{ platform.isTauri ? 'the desktop app' : 'a browser' }}.</p>
    </div>
  </div>
</template>

<style scoped>
.demo-button {
  height: 28px;
  border-radius: var(--xbo-radius-sm);
  padding: 0 12px;
  background: var(--xbo-window);
  box-shadow: inset 0 0 0 1px var(--xbo-field-border);
  color: var(--xbo-ink);
  font-size: calc(13px * var(--xbo-text-scale));
  font-weight: 500;
}

.demo-button:hover {
  background: var(--xbo-chrome);
}
</style>
