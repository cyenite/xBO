import {
  boundsForSnap,
  cascadeBounds,
  clampBounds,
  defaultSizeLimits,
  maximizedBounds,
  type Bounds,
  type Size,
  type SizeLimits,
  type SnapZone,
} from './geometry';

export type WindowMode = 'normal' | 'minimized' | 'maximized';
export type WindowParams = Record<string, string>;
export type WindowState = Record<string, unknown>;

export interface WindowAppInfo {
  label: string;
  limits: SizeLimits;
  defaultSize: Size;
  isResizable: boolean;
  isSingleInstance: boolean;
}

export interface DesktopWindow {
  z: number;
  id: string;
  appId: string;
  title: string;
  badge: string | null;
  mode: WindowMode;
  snap: SnapZone | null;
  state: WindowState;
  bounds: Bounds;
  params: WindowParams;
  isDirty: boolean;
  restoreMode: Exclude<WindowMode, 'minimized'>;
  restoreBounds: Bounds;
}

export interface WindowManagerState {
  topZ: number;
  windows: DesktopWindow[];
  workspace: Bounds;
  dropPreview: Bounds | null;
  openedCount: number;
  rememberedBounds: Record<string, Bounds>;
}

export interface WindowManagerOptions {
  resolveApp: (appId: string) => WindowAppInfo | undefined;
  isBoundsMemoryEnabled?: () => boolean;
  compactWorkspaceWidth?: number;
  onBoundsRemembered?: (rememberedBounds: Record<string, Bounds>) => void;
}

export interface OpenOptions {
  title?: string;
  state?: WindowState;
  params?: WindowParams;
  isNewWindow?: boolean;
}

export interface SessionWindow {
  z: number;
  appId: string;
  title: string;
  mode: WindowMode;
  snap: SnapZone | null;
  state: WindowState;
  bounds: Bounds;
  params: WindowParams;
  restoreMode: Exclude<WindowMode, 'minimized'>;
  restoreBounds: Bounds;
}

export interface SessionSnapshot {
  version: 1;
  windows: SessionWindow[];
}

export const defaultCompactWorkspaceWidth = 760;

export function createWindowManagerState(rememberedBounds: Record<string, Bounds> = {}): WindowManagerState {
  return {
    topZ: 0,
    windows: [],
    workspace: { x: 0, y: 30, width: 1280, height: 720 },
    dropPreview: null,
    openedCount: 0,
    rememberedBounds,
  };
}

function haveSameParams(left: WindowParams, right: WindowParams): boolean {
  const leftKeys = Object.keys(left);

  return leftKeys.length === Object.keys(right).length && leftKeys.every((key) => left[key] === right[key]);
}

// Single-instance apps always reuse their window; others reuse one showing the same params unless a new window is asked for.
function reusableWindows(app: WindowAppInfo, existing: DesktopWindow[], openOptions: OpenOptions): DesktopWindow[] {
  if (app.isSingleInstance) return existing;
  if (openOptions.isNewWindow) return [];
  if (!openOptions.params) return existing;

  return existing.filter((candidate) => haveSameParams(candidate.params, openOptions.params ?? {}));
}

function topmost(windows: DesktopWindow[]): DesktopWindow {
  return windows.reduce((top, candidate) => (candidate.z > top.z ? candidate : top));
}

// Operations mutate the state object they are given, so a UI binding can pass a reactive proxy and observe every change.
export function createWindowManager(state: WindowManagerState, options: WindowManagerOptions) {
  const compactWorkspaceWidth = options.compactWorkspaceWidth ?? defaultCompactWorkspaceWidth;

  function limitsFor(appId: string): SizeLimits {
    return options.resolveApp(appId)?.limits ?? defaultSizeLimits;
  }

  function focusedWindow(): DesktopWindow | null {
    let focused: DesktopWindow | null = null;

    for (const desktopWindow of state.windows) {
      if (desktopWindow.mode === 'minimized') continue;
      if (focused === null || desktopWindow.z > focused.z) focused = desktopWindow;
    }

    return focused;
  }

  function find(windowId: string): DesktopWindow | undefined {
    return state.windows.find((desktopWindow) => desktopWindow.id === windowId);
  }

  function windowsForApp(appId: string): DesktopWindow[] {
    return state.windows.filter((desktopWindow) => desktopWindow.appId === appId);
  }

  function byRecency(): DesktopWindow[] {
    return [...state.windows].sort((a, b) => b.z - a.z);
  }

  function rememberBounds(desktopWindow: DesktopWindow): void {
    if (options.isBoundsMemoryEnabled && !options.isBoundsMemoryEnabled()) return;

    state.rememberedBounds = { ...state.rememberedBounds, [desktopWindow.appId]: desktopWindow.restoreBounds };
    options.onBoundsRemembered?.(state.rememberedBounds);
  }

  function focus(windowId: string): void {
    const desktopWindow = find(windowId);

    if (!desktopWindow) return;
    if (desktopWindow.mode === 'minimized') desktopWindow.mode = desktopWindow.restoreMode;
    if (desktopWindow.z === state.topZ) return;

    desktopWindow.z = ++state.topZ;
  }

  function maximize(windowId: string): void {
    const desktopWindow = find(windowId);

    if (!desktopWindow) return;
    if (desktopWindow.mode === 'normal' && desktopWindow.snap === null) desktopWindow.restoreBounds = desktopWindow.bounds;

    desktopWindow.mode = 'maximized';
    desktopWindow.snap = null;
    desktopWindow.bounds = maximizedBounds(state.workspace);
    focus(windowId);
  }

  function open(appId: string, openOptions: OpenOptions = {}): DesktopWindow | null {
    const app = options.resolveApp(appId);

    if (!app) return null;

    const params = openOptions.params ?? {};
    const existing = windowsForApp(appId);
    const reusable = reusableWindows(app, existing, openOptions);

    if (reusable.length > 0) {
      const latest = topmost(reusable);

      if (app.isSingleInstance && openOptions.params) latest.params = params;

      focus(latest.id);

      return latest;
    }

    const remembered = state.rememberedBounds[appId];
    const bounds = remembered && existing.length === 0
      ? clampBounds(remembered, state.workspace, app.limits)
      : cascadeBounds(state.openedCount, app.defaultSize, state.workspace, app.limits);
    const desktopWindow: DesktopWindow = {
      z: ++state.topZ,
      id: `${appId}-${++state.openedCount}`,
      appId,
      title: openOptions.title ?? (existing.length === 0 ? app.label : `${app.label} ${existing.length + 1}`),
      badge: null,
      mode: 'normal',
      snap: null,
      state: openOptions.state ?? {},
      bounds,
      params,
      isDirty: false,
      restoreMode: 'normal',
      restoreBounds: bounds,
    };

    state.windows.push(desktopWindow);

    if (state.workspace.width < compactWorkspaceWidth) maximize(desktopWindow.id);

    return find(desktopWindow.id) ?? null;
  }

  function close(windowId: string): void {
    const desktopWindow = find(windowId);

    if (desktopWindow) rememberBounds(desktopWindow);

    state.windows = state.windows.filter((candidate) => candidate.id !== windowId);
  }

  function closeApp(appId: string): void {
    for (const desktopWindow of windowsForApp(appId)) close(desktopWindow.id);
  }

  function minimize(windowId: string): void {
    const desktopWindow = find(windowId);

    if (!desktopWindow || desktopWindow.mode === 'minimized') return;

    desktopWindow.restoreMode = desktopWindow.mode;
    desktopWindow.mode = 'minimized';
  }

  function restore(windowId: string): void {
    const desktopWindow = find(windowId);

    if (!desktopWindow) return;

    desktopWindow.mode = 'normal';
    desktopWindow.snap = null;
    desktopWindow.bounds = clampBounds(desktopWindow.restoreBounds, state.workspace, limitsFor(desktopWindow.appId));
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
    desktopWindow.bounds = boundsForSnap(zone, state.workspace);
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

    const latest = topmost(appWindows);

    if (focusedWindow()?.id === latest.id) minimize(latest.id);
    else focus(latest.id);
  }

  function minimizeAll(): void {
    for (const desktopWindow of state.windows) minimize(desktopWindow.id);
  }

  // Moves focus through windows by recency, like Alt+Tab: forward brings up the least recently focused window.
  function cycleFocus(direction: 'forward' | 'backward' = 'forward'): void {
    const ordered = byRecency();

    if (ordered.length < 2) return;

    const target = direction === 'forward' ? ordered[ordered.length - 1] : ordered[1];

    if (target) focus(target.id);
  }

  function setWorkspace(next: Bounds): void {
    state.workspace = next;

    for (const desktopWindow of state.windows) {
      const layoutMode = desktopWindow.mode === 'minimized' ? desktopWindow.restoreMode : desktopWindow.mode;

      if (layoutMode === 'maximized') desktopWindow.bounds = maximizedBounds(next);
      else if (desktopWindow.snap !== null) desktopWindow.bounds = boundsForSnap(desktopWindow.snap, next);
      else desktopWindow.bounds = clampBounds(desktopWindow.bounds, next, limitsFor(desktopWindow.appId));
    }
  }

  function update(windowId: string, changes: Partial<Pick<DesktopWindow, 'title' | 'badge' | 'state' | 'params' | 'isDirty'>>): void {
    const desktopWindow = find(windowId);

    if (desktopWindow) Object.assign(desktopWindow, changes);
  }

  function serializeSession(): SessionSnapshot {
    return {
      version: 1,
      windows: state.windows.map((desktopWindow) => ({
        z: desktopWindow.z,
        appId: desktopWindow.appId,
        title: desktopWindow.title,
        mode: desktopWindow.mode,
        snap: desktopWindow.snap,
        state: desktopWindow.state,
        bounds: desktopWindow.bounds,
        params: desktopWindow.params,
        restoreMode: desktopWindow.restoreMode,
        restoreBounds: desktopWindow.restoreBounds,
      })),
    };
  }

  // Windows of apps that no longer exist are dropped, and every window is laid out again for the current workspace.
  function restoreSession(snapshot: SessionSnapshot): number {
    if (snapshot.version !== 1) return 0;

    const restorable = [...snapshot.windows].filter((saved) => options.resolveApp(saved.appId)).sort((a, b) => a.z - b.z);

    for (const saved of restorable) {
      const limits = limitsFor(saved.appId);

      state.windows.push({
        ...saved,
        z: ++state.topZ,
        id: `${saved.appId}-${++state.openedCount}`,
        badge: null,
        bounds: clampBounds(saved.bounds, state.workspace, limits),
        isDirty: false,
        restoreBounds: clampBounds(saved.restoreBounds, state.workspace, limits),
      });
    }

    setWorkspace(state.workspace);

    return restorable.length;
  }

  return {
    state,
    focusedWindow,
    find,
    windowsForApp,
    byRecency,
    open,
    focus,
    close,
    closeApp,
    minimize,
    maximize,
    restore,
    toggleMaximize,
    snap,
    setBounds,
    commitBounds,
    activateApp,
    minimizeAll,
    cycleFocus,
    setWorkspace,
    update,
    serializeSession,
    restoreSession,
  };
}

export type WindowManager = ReturnType<typeof createWindowManager>;
