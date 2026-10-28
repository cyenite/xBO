import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useWindowsStore } from './windows';

describe('window manager', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('reuses a single-instance app window instead of opening a second', () => {
    const store = useWindowsStore();

    store.open('settings');
    store.open('settings');

    expect(store.windows).toHaveLength(1);
  });

  it('opens a second window for multi-instance apps on request', () => {
    const store = useWindowsStore();

    store.open('sales-orders');
    store.open('sales-orders', { isNewWindow: true });

    expect(store.windowsForApp('sales-orders').map((desktopWindow) => desktopWindow.title)).toEqual(['Sales orders', 'Sales orders 2']);
  });

  it('focuses the most recently opened window', () => {
    const store = useWindowsStore();

    store.open('overview');
    const settings = store.open('settings');

    expect(store.focusedWindow?.id).toBe(settings?.id);
  });

  it('restores a snapped window to its previous size', () => {
    const store = useWindowsStore();
    const desktopWindow = store.open('sales-orders');

    if (!desktopWindow) throw new Error('window did not open');

    const original = { ...desktopWindow.bounds };

    store.snap(desktopWindow.id, 'left');
    expect(store.find(desktopWindow.id)?.snap).toBe('left');

    store.restore(desktopWindow.id);
    expect(store.find(desktopWindow.id)?.bounds).toEqual(original);
  });

  it('minimises the focused app from the taskbar and brings it back', () => {
    const store = useWindowsStore();
    const desktopWindow = store.open('overview');

    store.activateApp('overview');
    expect(store.find(desktopWindow?.id ?? '')?.mode).toBe('minimized');
    expect(store.focusedWindow).toBeNull();

    store.activateApp('overview');
    expect(store.find(desktopWindow?.id ?? '')?.mode).toBe('normal');
  });

  it('keeps maximised windows filling the workspace when it resizes', () => {
    const store = useWindowsStore();
    const desktopWindow = store.open('overview');

    store.maximize(desktopWindow?.id ?? '');
    store.setWorkspace({ x: 0, y: 30, width: 900, height: 500 });

    expect(store.find(desktopWindow?.id ?? '')?.bounds).toEqual({ x: 0, y: 30, width: 900, height: 500 });
  });
});
