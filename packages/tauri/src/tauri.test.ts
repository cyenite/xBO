import { afterEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, unknown>();

vi.mock('@tauri-apps/plugin-store', () => ({
  load: vi.fn(async () => ({
    get: async (key: string) => store.get(key),
    set: async (key: string, value: unknown) => void store.set(key, value),
    delete: async (key: string) => store.delete(key),
    save: async () => undefined,
  })),
}));

describe('tauriStorage', () => {
  it('saves, loads and removes values through the store plugin', async () => {
    const { tauriStorage } = await import('./storage');
    const storage = tauriStorage({ path: 'test.json' });

    await storage.save('preferences', { density: 'comfortable' });
    expect(await storage.load('preferences')).toEqual({ density: 'comfortable' });

    await storage.remove('preferences');
    expect(await storage.load('preferences')).toBeUndefined();
  });
});

describe('tauriConfig', () => {
  afterEach(() => {
    delete (globalThis.window as unknown as Record<string, unknown>).__TAURI_INTERNALS__;
  });

  it('contributes nothing in a browser', async () => {
    const { tauriConfig } = await import('./index');

    expect(tauriConfig()).toEqual({ statusItems: [], preferences: {} });
  });

  it('adds window controls and the store adapter in the desktop app', async () => {
    (globalThis.window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {};

    const { tauriConfig } = await import('./index');
    const config = tauriConfig({ hasWindowControls: true });

    expect(config.statusItems).toHaveLength(1);
    expect('storage' in config.preferences).toBe(true);
    expect(tauriConfig({ hasWindowControls: false }).statusItems).toHaveLength(0);
  });
});
