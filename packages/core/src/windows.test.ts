import { describe, expect, it } from 'vitest';
import { defaultSizeLimits } from './geometry';
import { createWindowManager, createWindowManagerState, type WindowAppInfo } from './windows';

const apps: Record<string, WindowAppInfo> = {
  notes: { label: 'Notes', limits: defaultSizeLimits, defaultSize: { width: 800, height: 500 }, isResizable: true, isSingleInstance: false },
  settings: { label: 'Settings', limits: defaultSizeLimits, defaultSize: { width: 700, height: 500 }, isResizable: true, isSingleInstance: true },
};

function setup(rememberedBounds = {}) {
  const remembered: Record<string, unknown>[] = [];
  const manager = createWindowManager(createWindowManagerState(rememberedBounds), {
    resolveApp: (appId) => apps[appId],
    onBoundsRemembered: (bounds) => void remembered.push(bounds),
  });

  return { manager, remembered };
}

describe('window manager', () => {
  it('reuses a single-instance app window instead of opening a second', () => {
    const { manager } = setup();

    manager.open('settings');
    manager.open('settings', { isNewWindow: true });

    expect(manager.state.windows).toHaveLength(1);
  });

  it('opens a numbered second window for multi-instance apps on request', () => {
    const { manager } = setup();

    manager.open('notes');
    manager.open('notes', { isNewWindow: true });

    expect(manager.windowsForApp('notes').map((desktopWindow) => desktopWindow.title)).toEqual(['Notes', 'Notes 2']);
  });

  it('opens one window per distinct params and refocuses a window with the same params', () => {
    const { manager } = setup();
    const first = manager.open('notes', { params: { id: '1' } });

    manager.open('notes', { params: { id: '2' } });
    manager.open('notes', { params: { id: '1' } });

    expect(manager.windowsForApp('notes')).toHaveLength(2);
    expect(manager.focusedWindow()?.id).toBe(first?.id);
  });

  it('ignores apps it cannot resolve', () => {
    expect(setup().manager.open('missing')).toBeNull();
  });

  it('focuses the most recently opened window', () => {
    const { manager } = setup();

    manager.open('notes');
    const settings = manager.open('settings');

    expect(manager.focusedWindow()?.id).toBe(settings?.id);
  });

  it('restores a snapped window to its previous size', () => {
    const { manager } = setup();
    const desktopWindow = manager.open('notes');

    if (!desktopWindow) throw new Error('window did not open');

    const original = { ...desktopWindow.bounds };

    manager.snap(desktopWindow.id, 'left');
    expect(manager.find(desktopWindow.id)?.snap).toBe('left');

    manager.restore(desktopWindow.id);
    expect(manager.find(desktopWindow.id)?.bounds).toEqual(original);
  });

  it('minimises the focused app from the taskbar and brings it back', () => {
    const { manager } = setup();
    const desktopWindow = manager.open('notes');

    manager.activateApp('notes');
    expect(manager.find(desktopWindow?.id ?? '')?.mode).toBe('minimized');
    expect(manager.focusedWindow()).toBeNull();

    manager.activateApp('notes');
    expect(manager.find(desktopWindow?.id ?? '')?.mode).toBe('normal');
  });

  it('keeps maximised windows filling the workspace when it resizes', () => {
    const { manager } = setup();
    const desktopWindow = manager.open('notes');

    manager.maximize(desktopWindow?.id ?? '');
    manager.setWorkspace({ x: 0, y: 30, width: 900, height: 500 });

    expect(manager.find(desktopWindow?.id ?? '')?.bounds).toEqual({ x: 0, y: 30, width: 900, height: 500 });
  });

  it('maximises new windows on a compact workspace', () => {
    const { manager } = setup();

    manager.setWorkspace({ x: 0, y: 30, width: 600, height: 700 });

    expect(manager.open('notes')?.mode).toBe('maximized');
  });

  it('remembers the bounds of a closed window and reuses them next time', () => {
    const { manager, remembered } = setup();
    const desktopWindow = manager.open('notes');

    manager.setBounds(desktopWindow?.id ?? '', { x: 40, y: 60, width: 640, height: 420 });
    manager.close(desktopWindow?.id ?? '');

    expect(remembered).toHaveLength(1);
    expect(manager.open('notes')?.bounds).toEqual({ x: 40, y: 60, width: 640, height: 420 });
  });

  it('cycles focus to the least recently focused window', () => {
    const { manager } = setup();
    const first = manager.open('notes');

    manager.open('notes', { isNewWindow: true });
    manager.open('settings');
    manager.cycleFocus();

    expect(manager.focusedWindow()?.id).toBe(first?.id);
  });

  it('restores a saved session, keeping order and dropping unknown apps', () => {
    const { manager } = setup();

    manager.open('notes', { params: { id: '7' }, state: { scroll: 120 } });
    manager.open('settings');

    const snapshot = manager.serializeSession();
    const restored = setup().manager;

    snapshot.windows.push({ ...snapshot.windows[0]!, appId: 'removed-app' });

    expect(restored.restoreSession(snapshot)).toBe(2);
    expect(restored.focusedWindow()?.appId).toBe('settings');
    expect(restored.windowsForApp('notes')[0]).toMatchObject({ params: { id: '7' }, state: { scroll: 120 } });
  });

  it('updates title, badge and dirty state', () => {
    const { manager } = setup();
    const desktopWindow = manager.open('notes');

    manager.update(desktopWindow?.id ?? '', { title: 'Draft', badge: '3', isDirty: true });

    expect(manager.find(desktopWindow?.id ?? '')).toMatchObject({ title: 'Draft', badge: '3', isDirty: true });
  });
});
