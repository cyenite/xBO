import { getCurrentScope, onScopeDispose, ref } from 'vue';
import { isTauriRuntime } from '@xbo-ui/core';

export interface NativeWindow {
  minimize(): Promise<void>;
  toggleMaximize(): Promise<void>;
  close(): Promise<void>;
  isMaximized(): Promise<boolean>;
  onResized(handler: () => void): Promise<() => void>;
}

async function currentWindow(): Promise<NativeWindow> {
  const { getCurrentWindow } = await import('@tauri-apps/api/window');

  return getCurrentWindow() as unknown as NativeWindow;
}

// Controls the native app window, for frameless windows whose title bar is drawn by xBO.
export function useTauriWindow() {
  const isMaximized = ref(false);
  const isAvailable = isTauriRuntime();
  let stopListening: (() => void) | null = null;

  async function refresh(): Promise<void> {
    if (isAvailable) isMaximized.value = await (await currentWindow()).isMaximized();
  }

  if (isAvailable) {
    void refresh();
    void currentWindow()
      .then((nativeWindow) => nativeWindow.onResized(() => void refresh()))
      .then((stop) => (stopListening = stop));
  }

  if (getCurrentScope()) onScopeDispose(() => stopListening?.());

  return {
    isAvailable,
    isMaximized,
    minimize: async () => (await currentWindow()).minimize(),
    toggleMaximize: async () => (await currentWindow()).toggleMaximize(),
    close: async () => (await currentWindow()).close(),
  };
}

// Opens a link in the user's browser from the desktop app, and in a new tab on the web.
export async function openExternal(url: string): Promise<void> {
  if (!isTauriRuntime()) {
    globalThis.open?.(url, '_blank', 'noopener,noreferrer');

    return;
  }

  const { openUrl } = await import('@tauri-apps/plugin-opener');

  await openUrl(url);
}
