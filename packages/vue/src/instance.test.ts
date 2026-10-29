import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { memoryStorageAdapter } from '@xbo-ui/core';
import { builtInAppIds, defineApp } from './config';
import { createXbo } from './instance';
import XboDesktop from './shell/XboDesktop.vue';

const Blank = defineComponent({ render: () => h('div', 'app body') });

function setup(options: Parameters<typeof createXbo>[0] extends infer C ? Partial<C> : never = {}) {
  const storage = memoryStorageAdapter(options.preferences?.storage ? {} : {});

  return createXbo({
    apps: [defineApp({ id: 'notes', label: 'Notes', component: Blank }), defineApp({ id: 'single', label: 'Single', component: Blank, isSingleInstance: true })],
    preferences: { storage },
    startup: { isSessionRestored: false },
    ...options,
  });
}

function key(keyName: string, modifiers: Partial<Pick<KeyboardEvent, 'ctrlKey' | 'altKey' | 'metaKey' | 'shiftKey'>> = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: keyName, cancelable: true, ...modifiers });
}

describe('createXbo', () => {
  it('registers configured apps and the built-in settings and about apps', () => {
    const xbo = setup();

    expect(xbo.findApp('notes')?.label).toBe('Notes');
    expect(xbo.findApp(builtInAppIds.settings)?.isHidden).toBe(true);
    expect(xbo.findApp(builtInAppIds.about)?.label).toBe('About xBO');
  });

  it('can leave the built-in apps out', () => {
    const xbo = setup({ builtInApps: { settings: false, about: false } });

    expect(xbo.findApp(builtInAppIds.settings)).toBeUndefined();
  });

  it('persists preferences through the storage adapter', async () => {
    const storage = memoryStorageAdapter();
    const xbo = setup({ preferences: { storage } });

    xbo.setPreference('density', 'comfortable');
    await nextTick();

    expect(storage.load('preferences')).toMatchObject({ density: 'comfortable' });
  });

  it('keeps locked preferences at their developer default, even when stored data disagrees', () => {
    const storage = memoryStorageAdapter({ preferences: { appearance: 'dark' } });
    const xbo = setup({ preferences: { storage, locked: ['appearance'], defaults: { appearance: 'light' } } });

    expect(xbo.preferences.appearance).toBe('light');
    expect(xbo.setPreference('appearance', 'dark')).toBe(false);
    expect(xbo.preferences.appearance).toBe('light');
  });

  it('derives the theme from the accent preference', () => {
    const xbo = setup({ theme: { accent: '#7c3aed' } });
    const brandPrimary = xbo.theme.value.light.primary;

    xbo.setPreference('accent', 'forest');

    expect(xbo.theme.value.light.primary).not.toBe(brandPrimary);
    expect(xbo.themeCss.value).toContain(`[data-xbo-id='${xbo.id}']`);
  });
});

describe('windows and close guards', () => {
  it('asks before closing a window with unsaved changes', async () => {
    const xbo = setup();
    const opened = xbo.openWindow('notes');

    xbo.windows.update(opened!.id, { isDirty: true });

    const closing = xbo.requestClose(opened!.id);

    await nextTick();
    expect(xbo.dialogs).toHaveLength(1);
    expect(xbo.dialogs[0]?.windowId).toBe(opened!.id);

    xbo.settleDialog(xbo.dialogs[0]!.id, false);
    expect(await closing).toBe(false);
    expect(xbo.windows.find(opened!.id)).toBeDefined();
  });

  it('lets a close guard veto closing', async () => {
    const xbo = setup();
    const opened = xbo.openWindow('notes');
    let isAllowed = false;

    xbo.addCloseGuard(opened!.id, () => isAllowed);

    expect(await xbo.requestClose(opened!.id)).toBe(false);

    isAllowed = true;

    expect(await xbo.requestClose(opened!.id)).toBe(true);
    expect(xbo.windows.find(opened!.id)).toBeUndefined();
  });

  it('closes the launcher and palette when an app opens', () => {
    const xbo = setup();

    xbo.ui.isLauncherOpen = true;
    xbo.openWindow('notes');

    expect(xbo.ui.isLauncherOpen).toBe(false);
  });
});

describe('notifications', () => {
  it('keeps notifications in the list and shows a toast', () => {
    const xbo = setup();

    xbo.notify({ title: 'Saved', duration: 0 });

    expect(xbo.notifications).toHaveLength(1);
    expect(xbo.toasts).toHaveLength(1);
    expect(xbo.unreadCount.value).toBe(1);

    xbo.markAllRead();
    expect(xbo.unreadCount.value).toBe(0);
  });

  it('suppresses pop-ups while do not disturb is on', () => {
    const xbo = setup();

    xbo.setPreference('isDoNotDisturbOn', true);
    xbo.notify({ title: 'Quiet' });

    expect(xbo.notifications).toHaveLength(1);
    expect(xbo.toasts).toHaveLength(0);
  });

  it('shows transient toasts without keeping them', () => {
    const xbo = setup();

    xbo.notify({ title: 'Copied', isTransient: true, duration: 0 });

    expect(xbo.notifications).toHaveLength(0);
    expect(xbo.toasts).toHaveLength(1);
  });
});

describe('shortcuts', () => {
  it('runs the handler of the matching shortcut and prevents the browser default', () => {
    const xbo = setup();
    let count = 0;

    xbo.onShortcut('palette', () => (count += 1));

    const event = key('k', xbo.os === 'macos' ? { metaKey: true } : { ctrlKey: true });

    xbo.handleKeydown(event);

    expect(count).toBe(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('prefers the focused window’s handler over a global one', () => {
    const xbo = setup();
    const calls: string[] = [];
    const opened = xbo.openWindow('notes');

    xbo.onShortcut('close', () => calls.push('global'));
    xbo.onShortcut('close', () => calls.push('window'), opened!.id);
    xbo.handleKeydown(key('w', { ctrlKey: true, altKey: true }));

    expect(calls).toEqual(['window']);
  });

  it('applies user rebinding', () => {
    const xbo = setup();
    let count = 0;

    xbo.onShortcut('settings', () => (count += 1));
    xbo.setPreference('shortcutOverrides', { settings: 'Ctrl+Alt+S' });
    xbo.handleKeydown(key('s', { ctrlKey: true, altKey: true }));

    expect(count).toBe(1);
  });

  it('keeps a shortcut defined until its last owner goes away', () => {
    const xbo = setup();
    const first = xbo.defineShortcut({ id: 'app:save', label: 'Save', scope: 'window', defaultBinding: 'Mod+S' });
    const second = xbo.defineShortcut({ id: 'app:save', label: 'Save', scope: 'window', defaultBinding: 'Mod+S' });

    first();
    expect(xbo.shortcutDefinitions.has('app:save')).toBe(true);

    second();
    expect(xbo.shortcutDefinitions.has('app:save')).toBe(false);
  });
});

describe('XboDesktop', () => {
  it('renders the shell and opens the startup apps', async () => {
    const xbo = setup({ startup: { open: ['notes'], isSessionRestored: false }, shell: { isFullscreen: false } });
    const wrapper = mount(XboDesktop, { global: { plugins: [xbo] }, attachTo: document.body });

    await nextTick();
    await nextTick();

    expect(wrapper.find('.xbo-desktop').attributes('data-xbo-id')).toBe(xbo.id);
    expect(wrapper.find('nav[aria-label="Taskbar"]').exists()).toBe(true);
    expect(wrapper.find('section[aria-label="Notes"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('app body');

    wrapper.unmount();
  });
});
