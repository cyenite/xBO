import type { StorageAdapter } from '@xbo-ui/core';

export interface TauriStorageOptions {
  path?: string;
}

interface StoreLike {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<boolean>;
  save(): Promise<void>;
}

// Preferences, window sizes and the session live in the app's data directory, so they survive reinstalls of the
// webview cache and are shared by every window of the app. The store plugin is loaded on first use.
export function tauriStorage(options: TauriStorageOptions = {}): StorageAdapter {
  const path = options.path ?? 'xbo.json';
  let store: Promise<StoreLike> | null = null;

  function open(): Promise<StoreLike> {
    store ??= import('@tauri-apps/plugin-store').then(({ load }) => load(path, { autoSave: 200, defaults: {} }) as Promise<StoreLike>);

    return store;
  }

  return {
    load: async (key) => (await open()).get(key),
    save: async (key, value) => {
      const opened = await open();

      await opened.set(key, value);
    },
    remove: async (key) => {
      const opened = await open();

      await opened.delete(key);
    },
  };
}
