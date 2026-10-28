import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { findApp } from '../apps/catalog';
import { readStored, writeStored } from '../storage';
import {
  boundsForSnap,
  cascadeBounds,
  clampBounds,
  maximizedBounds,
  type Bounds,
  type SnapZone,
} from '../shell/geometry';

export type WindowMode = 'normal' | 'minimized' | 'maximized';

export interface DesktopWindow {
  id: string;
  z: number;
  appId: string;
  title: string;
  mode: WindowMode;
  snap: SnapZone | null;
  bounds: Bounds;
  restoreMode: Exclude<WindowMode, 'minimized'>;
  restoreBounds: Bounds;
}

export interface OpenOptions {
  isNewWindow?: boolean;
}

const boundsStorageKey = 'xbo.window-bounds';
const compactWorkspaceWidth = 760;

export const useWindowsStore = defineStore('windows', () => {
  const windows = ref<DesktopWindow[]>([]);
  const workspace = ref<Bounds>({ x: 0, y: 30, width: 1280, height: 720 });
  const dropPreview = ref<Bounds | null>(null);
  const rememberedBounds = ref<Record<string, Bounds>>(readStored(boundsStorageKey, {}));

  let topZ = 0;
  let openedCount = 0;

  const focusedWindow = computed<DesktopWindow | null>(() => {
    let focused: DesktopWindow | null = null;

    for (const desktopWindow of windows.value) {
      if (desktopWindow.mode === 'minimized') continue;
      if (focused === null || desktopWindow.z > focused.z) focused = desktopWindow;
    }

    return focused;
  });

  const runningAppIds = computed(() => new Set(windows.value.map((desktopWindow) => desktopWindow.appId)));

  function find(windowId: string): DesktopWindow | undefined {
    return windows.value.find((desktopWindow) => desktopWindow.id === windowId);
  }

  function windowsForApp(appId: string): DesktopWindow[] {
    return windows.value.filter((desktopWindow) => desktopWindow.appId === appId);
  }

  function rememberBounds(desktopWindow: DesktopWindow): void {
    rememberedBounds.value = { ...rememberedBounds.value, [desktopWindow.appId]: desktopWindow.restoreBounds };
    writeStored(boundsStorageKey, rememberedBounds.value);
  }

  function focus(windowId: string): void {
    const desktopWindow = find(windowId);

    if (!desktopWindow) return;
    if (desktopWindow.mode === 'minimized') desktopWindow.mode = desktopWindow.restoreMode;
    if (desktopWindow.z === topZ) return;

    desktopWindow.z = ++topZ;
  }

  function open(appId: string, options: OpenOptions = {}): DesktopWindow | null {
    const app = findApp(appId);

    if (!app) return null;

    const existing = windowsForApp(appId);
    const shouldReuse = existing.length > 0 && (app.isSingleInstance || !options.isNewWindow);

    if (shouldReuse) {
      const latest = existing.reduce((top, candidate) => (candidate.z > top.z ? candidate : top));

      focus(latest.id);

      return latest;
    }

    const remembered = rememberedBounds.value[appId];
    const bounds = remembered && existing.length === 0
      ? clampBounds(remembered, workspace.value)
      : cascadeBounds(openedCount, app.defaultSize, workspace.value);
    const desktopWindow: DesktopWindow = {
      id: `${appId}-${++openedCount}`,
      z: ++topZ,
      appId,
      title: existing.length === 0 ? app.label : `${app.label} ${existing.length + 1}`,
      mode: 'normal',
      snap: null,
      bounds,
      restoreMode: 'normal',
      restoreBounds: bounds,
    };

    windows.value.push(desktopWindow);

    if (workspace.value.width < compactWorkspaceWidth) maximize(desktopWindow.id);

    return find(desktopWindow.id) ?? null;
  }

  function close(windowId: string): void {
    const desktopWindow = find(windowId);

    if (desktopWindow) rememberBounds(desktopWindow);

    windows.value = windows.value.filter((candidate) => candidate.id !== windowId);
  }

  function minimize(windowId: string): void {
    const desktopWindow = find(windowId);

    if (!desktopWindow || desktopWindow.mode === 'minimized') return;

    desktopWindow.restoreMode = desktopWindow.mode;
    desktopWindow.mode = 'minimized';
  }

  function maximize(windowId: string): void {
    const desktopWindow = find(windowId);

    if (!desktopWindow) return;
    if (desktopWindow.mode === 'normal' && desktopWindow.snap === null) desktopWindow.restoreBounds = desktopWindow.bounds;

    desktopWindow.mode = 'maximized';
    desktopWindow.snap = null;
    desktopWindow.bounds = maximizedBounds(workspace.value);
    focus(windowId);
  }

  function restore(windowId: string): void {
    const desktopWindow = find(windowId);

    if (!desktopWindow) return;

    desktopWindow.mode = 'normal';
    desktopWindow.snap = null;
    desktopWindow.bounds = clampBounds(desktopWindow.restoreBounds, workspace.value);
    focus(windowId);
  }

  function toggleMaximize(windowId: string): void {
    const desktopWindow = find(windowId);

    if (!desktopWindow) return;
    if (desktopWindow.mode === 'maximized' || desktopWindow.snap !== null) restore(windowId);
    else maximize(windowId);
  }

  function snap(windowId: string, zone: SnapZone): void {
    const desktopWindow = find(windowId);

    if (!desktopWindow) return;
    if (desktopWindow.mode === 'normal' && desktopWindow.snap === null) desktopWindow.restoreBounds = desktopWindow.bounds;

    desktopWindow.mode = 'normal';
    desktopWindow.snap = zone;
    desktopWindow.bounds = boundsForSnap(zone, workspace.value);
    focus(windowId);
  }

  function setBounds(windowId: string, bounds: Bounds): void {
    const desktopWindow = find(windowId);

    if (!desktopWindow) return;

    desktopWindow.mode = 'normal';
    desktopWindow.snap = null;
    desktopWindow.bounds = bounds;
    desktopWindow.restoreBounds = bounds;
  }

  function commitBounds(windowId: string): void {
    const desktopWindow = find(windowId);

    if (desktopWindow) rememberBounds(desktopWindow);
  }

  function activateApp(appId: string): void {
    const appWindows = windowsForApp(appId);

    if (appWindows.length === 0) {
      open(appId);

      return;
    }

    const latest = appWindows.reduce((top, candidate) => (candidate.z > top.z ? candidate : top));
    const isFocused = focusedWindow.value?.id === latest.id;

    if (isFocused) minimize(latest.id);
    else focus(latest.id);
  }

  function minimizeAll(): void {
    for (const desktopWindow of windows.value) minimize(desktopWindow.id);
  }

  function setWorkspace(next: Bounds): void {
    workspace.value = next;

    for (const desktopWindow of windows.value) {
      const layoutMode = desktopWindow.mode === 'minimized' ? desktopWindow.restoreMode : desktopWindow.mode;

      if (layoutMode === 'maximized') desktopWindow.bounds = maximizedBounds(next);
      else if (desktopWindow.snap !== null) desktopWindow.bounds = boundsForSnap(desktopWindow.snap, next);
      else desktopWindow.bounds = clampBounds(desktopWindow.bounds, next);
    }
  }

  return {
    windows,
    workspace,
    dropPreview,
    focusedWindow,
    runningAppIds,
    find,
    windowsForApp,
    open,
    focus,
    close,
    minimize,
    maximize,
    restore,
    toggleMaximize,
    snap,
    setBounds,
    commitBounds,
    activateApp,
    minimizeAll,
    setWorkspace,
  };
});
