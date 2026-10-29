import { computed, getCurrentScope, inject, onScopeDispose, ref, watch, type InjectionKey, type Ref } from 'vue';
import { formatBinding, hostOsLabel, type PreferenceKey, type Preferences, type WindowParams, type WindowState } from '@xbo-ui/core';
import type { MenuDefinition } from './config';
import { xboKey, type CloseGuard, type Command, type DialogOptions, type NotifyOptions, type XboInstance } from './instance';

export const windowIdKey: InjectionKey<string> = Symbol('xbo-window');
export const windowBodyKey: InjectionKey<Ref<HTMLElement | null>> = Symbol('xbo-window-body');

function disposeWithScope(dispose: () => void): () => void {
  if (getCurrentScope()) onScopeDispose(dispose);

  return dispose;
}

export function useXbo(): XboInstance {
  const instance = inject(xboKey, null);

  if (!instance) throw new Error('xBO is not installed: call app.use(createXbo({...})) before mounting.');

  return instance;
}

export function useWindows() {
  const xbo = useXbo();

  return {
    list: computed(() => xbo.windows.state.windows),
    focused: xbo.focusedWindow,
    open: xbo.openWindow,
    close: xbo.requestClose,
    closeApp: xbo.requestCloseApp,
    focus: xbo.windows.focus,
    minimize: xbo.windows.minimize,
    maximize: xbo.windows.maximize,
    restore: xbo.windows.restore,
    snap: xbo.windows.snap,
    cycle: xbo.windows.cycleFocus,
    minimizeAll: xbo.windows.minimizeAll,
  };
}

export function useCurrentWindow() {
  const xbo = useXbo();
  const windowId = inject(windowIdKey, null);

  if (windowId === null) throw new Error('useCurrentWindow() only works inside a component rendered in an xBO window.');

  const current = computed(() => xbo.windows.find(windowId));

  function update(changes: Parameters<XboInstance['windows']['update']>[1]): void {
    xbo.windows.update(windowId!, changes);
  }

  return {
    id: windowId,
    window: current,
    params: computed<WindowParams>(() => current.value?.params ?? {}),
    isFocused: computed(() => xbo.focusedWindow.value?.id === windowId),
    setTitle: (title: string) => update({ title }),
    setBadge: (badge: string | null) => update({ badge }),
    setDirty: (isDirty: boolean) => update({ isDirty }),
    setParams: (params: WindowParams) => update({ params }),
    setState: (state: WindowState) => update({ state }),
    setMenus: (menus: MenuDefinition[]) => {
      xbo.windowMenus.set(windowId, menus);

      return disposeWithScope(() => void xbo.windowMenus.delete(windowId));
    },
    onBeforeClose: (guard: CloseGuard) => disposeWithScope(xbo.addCloseGuard(windowId, guard)),
    onShortcut: (shortcutId: string, run: (event: KeyboardEvent) => void) => disposeWithScope(xbo.onShortcut(shortcutId, run, windowId)),
    close: () => xbo.requestClose(windowId),
    focus: () => xbo.windows.focus(windowId),
    minimize: () => xbo.windows.minimize(windowId),
    toggleMaximize: () => xbo.windows.toggleMaximize(windowId),
    alert: (options: DialogOptions) => xbo.dialog.alert(options, windowId),
    confirm: (options: DialogOptions) => xbo.dialog.confirm(options, windowId),
    prompt: (options: DialogOptions) => xbo.dialog.prompt(options, windowId),
  };
}

export function useCommands() {
  const xbo = useXbo();

  return {
    list: computed(() => [...xbo.commands.values()]),
    register: (command: Command) => disposeWithScope(xbo.registerCommand(command)),
    openPalette: () => void (xbo.ui.isPaletteOpen = true),
  };
}

export interface ShortcutOptions {
  label?: string;
  scope?: 'global' | 'window';
  binding?: string;
}

// With a binding, defines a shortcut users can rebind in Settings (its id must be unique); without one, handles an existing id.
export function useShortcut(shortcutId: string, run: (event: KeyboardEvent) => void, options: ShortcutOptions = {}): () => void {
  const xbo = useXbo();
  const windowId = options.scope === 'window' ? inject(windowIdKey, null) : null;
  const disposers: (() => void)[] = [];

  if (options.binding) {
    disposers.push(xbo.defineShortcut({ id: shortcutId, label: options.label ?? shortcutId, scope: options.scope ?? 'global', defaultBinding: options.binding }));
  }

  disposers.push(xbo.onShortcut(shortcutId, run, windowId));

  return disposeWithScope(() => disposers.forEach((dispose) => dispose()));
}

export function useNotifications() {
  const xbo = useXbo();

  return {
    list: computed(() => xbo.notifications),
    unreadCount: xbo.unreadCount,
    notify: (options: NotifyOptions) => xbo.notify(options),
    toast: (options: NotifyOptions) => xbo.notify({ ...options, isTransient: true }),
    remove: xbo.removeNotification,
    clear: xbo.clearNotifications,
    markAllRead: xbo.markAllRead,
  };
}

export function useDialog() {
  return useXbo().dialog;
}

export function usePreferences() {
  const xbo = useXbo();

  return {
    values: xbo.preferences as Readonly<Preferences>,
    set: xbo.setPreference,
    reset: xbo.resetPreferences,
    isLocked: (key: PreferenceKey) => xbo.lockedKeys.has(key),
    isHidden: (key: PreferenceKey) => xbo.hiddenKeys.has(key),
  };
}

// App-specific settings persisted next to the desktop's own preferences, under the same storage adapter.
export function useAppPreference<T>(key: string, fallback: T): Ref<T> {
  const xbo = useXbo();
  const storageKey = `app.${key}`;
  const value = ref(fallback) as Ref<T>;

  void Promise.resolve(xbo.storage?.load(storageKey)).then((stored) => {
    if (stored !== undefined) value.value = stored as T;
  });

  watch(value, (next) => void xbo.storage?.save(storageKey, JSON.parse(JSON.stringify(next))), { deep: true });

  return value;
}

export function useTheme() {
  const xbo = useXbo();

  return {
    theme: xbo.theme,
    isDark: xbo.isDark,
    isContrastMore: xbo.isContrastMore,
    toggleAppearance: () => xbo.setPreference('appearance', xbo.isDark.value ? 'light' : 'dark'),
  };
}

export function usePlatform() {
  const xbo = useXbo();

  return {
    os: xbo.os,
    osLabel: hostOsLabel(xbo.os),
    isTauri: xbo.isTauri,
    formatBinding: (binding: string) => formatBinding(binding, xbo.os),
  };
}

export function useI18n() {
  const xbo = useXbo();

  return { t: xbo.t, locale: xbo.locale };
}

export function useFormat() {
  const xbo = useXbo();
  const hourCycle = computed(() => (xbo.preferences.hourCycle === 'locale' ? undefined : xbo.preferences.hourCycle));

  return {
    date: (value: Date | number, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) =>
      new Intl.DateTimeFormat(xbo.locale.value, { hourCycle: hourCycle.value, ...options }).format(value),
    time: (value: Date | number, options: Intl.DateTimeFormatOptions = { timeStyle: 'short' }) =>
      new Intl.DateTimeFormat(xbo.locale.value, { hourCycle: hourCycle.value, ...options }).format(value),
    number: (value: number, options: Intl.NumberFormatOptions = {}) => new Intl.NumberFormat(xbo.locale.value, options).format(value),
    currency: (value: number, currency: string) => new Intl.NumberFormat(xbo.locale.value, { style: 'currency', currency }).format(value),
    relative: (value: number, unit: Intl.RelativeTimeFormatUnit) => new Intl.RelativeTimeFormat(xbo.locale.value, { numeric: 'auto' }).format(value, unit),
  };
}
