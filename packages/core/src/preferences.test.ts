import { describe, expect, it } from 'vitest';
import { rankSearchables } from './commands';
import { detectHostOs, hasPrimaryModifier } from './platform';
import { defaultPreferences, normalizePreferences } from './preferences';
import { localStorageAdapter, memoryStorageAdapter } from './storage';

describe('preferences', () => {
  it('keeps valid stored values and drops unknown or malformed ones', () => {
    const normalized = normalizePreferences({ appearance: 'dark', density: 'roomy', accent: 'rose', isTaskbarAutoHidden: 'yes', extra: 1 });

    expect(normalized.appearance).toBe('dark');
    expect(normalized.accent).toBe('rose');
    expect(normalized.density).toBe(defaultPreferences.density);
    expect(normalized.isTaskbarAutoHidden).toBe(false);
    expect('extra' in normalized).toBe(false);
  });

  it('validates structured values', () => {
    expect(normalizePreferences({ wallpaper: { kind: 'image', value: '/bg.jpg' } }).wallpaper.kind).toBe('image');
    expect(normalizePreferences({ wallpaper: { kind: 'video', value: '' } }).wallpaper).toEqual(defaultPreferences.wallpaper);
    expect(normalizePreferences({ shortcutOverrides: { palette: 'Mod+P' } }).shortcutOverrides).toEqual({ palette: 'Mod+P' });
    expect(normalizePreferences({ pinnedAppIds: ['a', 2] }).pinnedAppIds).toBeNull();
  });

  it('falls back to defaults for anything that is not an object', () => {
    expect(normalizePreferences('broken')).toEqual(defaultPreferences);
  });

  it('uses developer defaults when given', () => {
    expect(normalizePreferences({}, { ...defaultPreferences, accent: 'forest' }).accent).toBe('forest');
  });
});

describe('storage', () => {
  it('namespaces localStorage keys and survives bad JSON', () => {
    const storage = localStorageAdapter('test');

    storage.save('prefs', { a: 1 });
    expect(localStorage.getItem('test.prefs')).toBe('{"a":1}');
    expect(storage.load('prefs')).toEqual({ a: 1 });

    localStorage.setItem('test.prefs', '{broken');
    expect(storage.load('prefs')).toBeUndefined();
  });

  it('copies values in memory so callers cannot mutate stored data', () => {
    const storage = memoryStorageAdapter();
    const value = { list: [1] };

    storage.save('key', value);
    value.list.push(2);

    expect(storage.load('key')).toEqual({ list: [1] });
  });
});

describe('platform and search', () => {
  it('detects the host operating system', () => {
    expect(detectHostOs({ userAgent: 'x', userAgentData: { platform: 'macOS' } })).toBe('macos');
    expect(detectHostOs({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' })).toBe('linux');
    expect(detectHostOs(null)).toBe('other');
    expect(hasPrimaryModifier({ ctrlKey: false, metaKey: true }, 'macos')).toBe(true);
  });

  it('ranks prefix matches first and keeps ties in order', () => {
    const items = [{ label: 'Close window' }, { label: 'Settings', keywords: ['preferences'] }, { label: 'Open settings file' }];

    expect(rankSearchables(items, 'set').map((item) => item.label)).toEqual(['Settings', 'Open settings file']);
    expect(rankSearchables(items, 'pref').map((item) => item.label)).toEqual(['Settings']);
  });
});
