import {
  computed,
  effectScope,
  markRaw,
  reactive,
  ref,
  shallowReactive,
  watch,
  type App,
  type Component,
  type InjectionKey,
} from 'vue';
import { useMediaQuery, usePreferredDark, watchDebounced } from '@vueuse/core';
import {
  createTheme,
  createWindowManager,
  createWindowManagerState,
  defaultPreferences,
  detectHostOs,
  formatBinding,
  isPromise,
  isTauriRuntime,
  localStorageAdapter,
  matchesBinding,
  normalizePreferences,
  themeToCss,
  type Bounds,
  type PreferenceKey,
  type Preferences,
  type SessionSnapshot,
  type WindowAppInfo,
  type WindowParams,
} from '@xbo-ui/core';
import AboutApp from './apps/AboutApp.vue';
import SettingsApp from './apps/SettingsApp.vue';
import type { StatusTone } from './components/status';
import {
  builtInAppIds,
  defaultShellOptions,
  defaultWallpapers,
  defineApp,
  defineSettingsSection,
  type AppDefinition,
  type AppInput,
  type Brand,
  type MenuDefinition,
  type SettingsSection,
  type SettingsSectionInput,
  type ShellOptions,
  type StartupWindow,
  type XboConfig,
} from './config';
import { englishMessages, interpolate, type MessageKey, type MessageParams, type Messages } from './i18n';
import { RiSettings3Line } from './icons';

export interface Command {
  id: string;
  icon?: Component;
  label: string;
  detail?: string;
  section: string;
  keywords?: string[];
  shortcutId?: string;
  run: () => void;
}

export interface ShortcutDefinition {
  id: string;
  label: string;
  scope: 'global' | 'window';
  defaultBinding: string;
}

interface ShortcutHandler {
  shortcutId: string;
  windowId: string | null;
  run: (event: KeyboardEvent) => void;
}

export interface NotificationAction {
  label: string;
  run: () => void;
}

export interface XboNotification {
  id: string;
  icon: Component | null;
  tone: StatusTone;
  body: string;
  title: string;
  appId: string | null;
  createdAt: number;
  actions: NotificationAction[];
  isRead: boolean;
}

export interface NotifyOptions {
  icon?: Component;
  tone?: StatusTone;
  body?: string;
  title: string;
  appId?: string;
  actions?: NotificationAction[];
  duration?: number;
  isTransient?: boolean;
}

export interface DialogOptions {
  tone?: 'default' | 'danger';
  title: string;
  message?: string;
  placeholder?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  defaultValue?: string;
}

export interface DialogRequest extends Required<Omit<DialogOptions, 'placeholder'>> {
  id: string;
  kind: 'alert' | 'confirm' | 'prompt';
  windowId: string | null;
  placeholder: string;
  resolve: (value: string | boolean | null) => void;
}

export type CloseGuard = () => boolean | Promise<boolean>;

export const xboKey: InjectionKey<XboInstance> = Symbol('xbo');

const builtInShortcuts: ShortcutDefinition[] = [
  { id: 'palette', label: 'shortcut.palette', scope: 'global', defaultBinding: 'Mod+K' },
  { id: 'launcher', label: 'shortcut.launcher', scope: 'global', defaultBinding: 'Ctrl+Escape' },
  { id: 'settings', label: 'shortcut.settings', scope: 'global', defaultBinding: 'Mod+,' },
  { id: 'switchWindow', label: 'shortcut.switchWindow', scope: 'global', defaultBinding: 'Ctrl+`' },
  { id: 'snapLeft', label: 'shortcut.snapLeft', scope: 'global', defaultBinding: 'Ctrl+Alt+ArrowLeft' },
  { id: 'snapRight', label: 'shortcut.snapRight', scope: 'global', defaultBinding: 'Ctrl+Alt+ArrowRight' },
  { id: 'maximize', label: 'shortcut.maximize', scope: 'global', defaultBinding: 'Ctrl+Alt+ArrowUp' },
  { id: 'minimize', label: 'shortcut.minimize', scope: 'global', defaultBinding: 'Ctrl+Alt+ArrowDown' },
  { id: 'close', label: 'shortcut.close', scope: 'global', defaultBinding: 'Ctrl+Alt+W' },
  { id: 'newWindow', label: 'shortcut.newWindow', scope: 'global', defaultBinding: 'Ctrl+Alt+N' },
  { id: 'notifications', label: 'shortcut.notifications', scope: 'global', defaultBinding: 'Ctrl+Alt+M' },
];

let instanceCount = 0;
let itemCount = 0;

function nextId(prefix: string): string {
  return `${prefix}-${++itemCount}`;
}

function isEditableTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;

  return !!element && (element.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName));
}

function cssUrl(value: string): string {
  return `url("${value.replace(/["\\\n]/g, (character) => `\\${character}`)}")`;
}

function toAppInfo(app: AppDefinition): WindowAppInfo {
  return {
    label: app.label,
    limits: { minSize: app.minSize, maxSize: app.maxSize },
    defaultSize: app.defaultSize,
    isResizable: app.isResizable,
    isSingleInstance: app.isSingleInstance,
  };
}

// Reactive state hands out proxies; adapters may serialise over IPC or with structuredClone, so they get plain data.
function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function loadInto<T>(value: unknown, apply: (loaded: T | undefined) => void): void {
  if (isPromise(value)) void value.then((loaded) => apply(loaded as T | undefined));
  else apply(value as T | undefined);
}

export function createXbo(config: XboConfig) {
  const scope = effectScope(true);
  const id = `xbo-${++instanceCount}`;

  return scope.run(() => {
    const os = detectHostOs();
    const isTauri = isTauriRuntime();
    const shell: ShellOptions = { ...defaultShellOptions, ...config.shell };
    const brand: Brand = {
      name: 'xBO',
      mark: null,
      version: '',
      homepage: '',
      copyright: '',
      description: '',
      ...config.brand,
    };
    const preferenceOptions = config.preferences ?? {};
    const storage = preferenceOptions.storage === null ? null : (preferenceOptions.storage ?? localStorageAdapter(preferenceOptions.namespace ?? 'xbo'));
    const lockedKeys = new Set<PreferenceKey>(preferenceOptions.locked ?? []);
    const hiddenKeys = new Set<PreferenceKey>(preferenceOptions.hidden ?? []);
    const themeRadius = typeof config.theme?.radius === 'string' ? { radius: config.theme.radius } : {};
    const preferenceDefaults: Preferences = { ...defaultPreferences, ...themeRadius, ...preferenceOptions.defaults };
    const preferences = reactive<Preferences>(normalizePreferences(undefined, preferenceDefaults));
    const isPreferencesLoaded = ref(false);

    const apps = shallowReactive<AppDefinition[]>([]);
    const groups = shallowReactive([...(config.groups ?? [])]);
    const menus = shallowReactive<MenuDefinition[]>([...(config.menus ?? [])]);
    const commands = shallowReactive(new Map<string, Command>());
    const statusItems = shallowReactive((config.statusItems ?? []).map((component) => ({ id: nextId('status'), component: markRaw(component) })));
    const settingsSections = shallowReactive<SettingsSection[]>((config.settingsSections ?? []).map(defineSettingsSection));
    const shortcutDefinitions = shallowReactive(new Map(builtInShortcuts.map((definition) => [definition.id, definition])));
    const shortcutHandlers = shallowReactive<ShortcutHandler[]>([]);
    const windowMenus = reactive(new Map<string, MenuDefinition[]>());
    const closeGuards = new Map<string, Set<CloseGuard>>();
    const notifications = reactive<XboNotification[]>([]);
    const toasts = reactive<{ id: string; notification: XboNotification }[]>([]);
    const dialogs = reactive<DialogRequest[]>([]);
    const ui = reactive({
      rootElement: null as HTMLElement | null,
      portalTarget: null as HTMLElement | null,
      isPaletteOpen: false,
      isLauncherOpen: false,
      isSwitcherOpen: false,
      switcherIndex: 0,
      recordingShortcutId: null as string | null,
      isNotificationCenterOpen: false,
    });

    const prefersDark = usePreferredDark();
    const prefersMoreContrast = useMediaQuery('(prefers-contrast: more)');
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const prefersReducedTransparency = useMediaQuery('(prefers-reduced-transparency: reduce)');
    const navigatorLocale = globalThis.navigator?.language ?? 'en';

    function findApp(appId: string): AppDefinition | undefined {
      return apps.find((app) => app.id === appId);
    }

    function registerApp(input: AppInput | AppDefinition): () => void {
      const app = 'isHidden' in input && 'menus' in input && 'minSize' in input ? (input as AppDefinition) : defineApp(input);
      const existing = apps.findIndex((candidate) => candidate.id === app.id);

      if (existing >= 0) apps.splice(existing, 1, app);
      else apps.push(app);

      return () => {
        const index = apps.indexOf(app);

        if (index >= 0) apps.splice(index, 1);
      };
    }

    for (const app of config.apps) registerApp(app);

    if (config.builtInApps?.settings !== false) {
      registerApp(defineApp({
        id: builtInAppIds.settings,
        icon: RiSettings3Line,
        group: null,
        label: 'Settings',
        keywords: ['preferences', 'theme', 'dark', 'appearance', 'keyboard', 'shortcuts', 'language'],
        component: SettingsApp,
        defaultSize: { width: 860, height: 600 },
        minSize: { width: 560, height: 380 },
        isSingleInstance: true,
        isHidden: true,
      }));
    }

    if (config.builtInApps?.about !== false) {
      registerApp(defineApp({
        id: builtInAppIds.about,
        label: `About ${brand.name}`,
        component: AboutApp,
        defaultSize: { width: 440, height: 380 },
        minSize: { width: 380, height: 300 },
        isResizable: false,
        isSingleInstance: true,
        isHidden: true,
      }));
    }

    const windowState = reactive(createWindowManagerState());
    const windows = createWindowManager(windowState, {
      resolveApp: (appId) => {
        const app = findApp(appId);

        return app ? toAppInfo(app) : undefined;
      },
      isBoundsMemoryEnabled: () => preferences.isBoundsMemoryOn,
      compactWorkspaceWidth: shell.compactWorkspaceWidth,
      onBoundsRemembered: (bounds) => void storage?.save('window-bounds', toPlain(bounds)),
    });
    const focusedWindow = computed(() => windows.focusedWindow());
    const runningAppIds = computed(() => new Set(windowState.windows.map((desktopWindow) => desktopWindow.appId)));

    function enforceLocks(): void {
      for (const key of lockedKeys) (preferences as Record<PreferenceKey, unknown>)[key] = preferenceDefaults[key];
    }

    loadInto<unknown>(storage?.load('preferences'), (loaded) => {
      Object.assign(preferences, normalizePreferences(loaded, preferenceDefaults));
      enforceLocks();
      isPreferencesLoaded.value = true;
    });

    loadInto<Record<string, Bounds>>(storage?.load('window-bounds'), (loaded) => {
      if (loaded && typeof loaded === 'object') windowState.rememberedBounds = loaded;
    });

    watch(
      preferences,
      () => {
        enforceLocks();

        if (isPreferencesLoaded.value) void storage?.save('preferences', toPlain(preferences));
      },
      { deep: true },
    );

    function setPreference<K extends PreferenceKey>(key: K, value: Preferences[K]): boolean {
      if (lockedKeys.has(key)) return false;

      preferences[key] = value;

      return true;
    }

    function resetPreferences(): void {
      Object.assign(preferences, normalizePreferences(undefined, preferenceDefaults));
    }

    const locale = computed(() => preferences.locale || config.i18n?.locale || navigatorLocale);
    const messages = computed<Messages>(() => {
      const locales = config.i18n?.locales ?? [];
      const language = locale.value.split('-')[0];
      const match = locales.find((option) => option.value === locale.value) ?? locales.find((option) => option.value === language);

      return { ...englishMessages, ...config.i18n?.messages, ...match?.messages };
    });

    function t(key: MessageKey, params?: MessageParams): string {
      return interpolate(messages.value[key] ?? key, params);
    }

    const isDark = computed(() => preferences.appearance === 'dark' || (preferences.appearance === 'system' && prefersDark.value));
    const isContrastMore = computed(() => preferences.contrast === 'more' || (preferences.contrast === 'system' && prefersMoreContrast.value));
    const isMotionReduced = computed(() => preferences.motion === 'reduced' || prefersReducedMotion.value);
    const isTransparencyReduced = computed(() => preferences.transparency === 'reduced' || prefersReducedTransparency.value);
    const chromeStyle = computed(() => (preferences.windowChrome !== 'auto' ? preferences.windowChrome : os === 'macos' ? 'macos' : 'windows'));

    const theme = computed(() => {
      const accent = preferences.accent;

      return createTheme({
        ...config.theme,
        accent: accent === 'brand' ? config.theme?.accent : undefined,
        preset: accent === 'brand' ? config.theme?.preset : accent,
        radius: typeof config.theme?.radius === 'object' ? config.theme.radius : preferences.radius,
      });
    });
    const themeCss = computed(() => themeToCss(theme.value, `[data-xbo-id='${id}']`));

    const wallpapers = config.wallpapers ?? defaultWallpapers;
    const wallpaperCss = computed(() => {
      const { kind, value } = preferences.wallpaper;

      if (kind === 'tint' || value === '') return undefined;

      return kind === 'image' ? `${cssUrl(value)} center / cover no-repeat` : value;
    });

    const rootAttributes = computed(() => ({
      'data-xbo-id': id,
      'data-xbo-mode': isDark.value ? 'dark' : 'light',
      'data-xbo-motion': isMotionReduced.value ? 'reduced' : 'system',
      'data-xbo-chrome': chromeStyle.value,
      'data-xbo-density': preferences.density,
      'data-xbo-contrast': isContrastMore.value ? 'more' : 'standard',
      'data-xbo-text-scale': preferences.textScale,
      'data-xbo-fullscreen': shell.isFullscreen ? '' : undefined,
      'data-xbo-transparency': isTransparencyReduced.value ? 'reduced' : 'system',
    }));

    // Launcher and Go menu order: configured groups in declaration order, then everything without a known group.
    const appSections = computed(() => {
      const visible = apps.filter((app) => !app.isHidden);
      const knownGroupIds = new Set(groups.map((group) => group.id));

      return [
        ...groups.map((group) => ({ id: group.id, label: group.label, apps: visible.filter((app) => app.group === group.id) })),
        { id: '', label: t('app.other'), apps: visible.filter((app) => !app.group || !knownGroupIds.has(app.group)) },
      ].filter((section) => section.apps.length > 0);
    });

    const pinnedAppIds = computed(() => preferences.pinnedAppIds ?? apps.filter((app) => app.isPinned).map((app) => app.id));

    function togglePin(appId: string): void {
      const pinned = pinnedAppIds.value;

      setPreference('pinnedAppIds', pinned.includes(appId) ? pinned.filter((candidate) => candidate !== appId) : [...pinned, appId]);
    }

    function registerCommand(command: Command): () => void {
      commands.set(command.id, { ...command, icon: command.icon ? markRaw(command.icon) : undefined });

      return () => void commands.delete(command.id);
    }

    const shortcutOwners = new Map<string, number>();

    // Several windows of one app define the same shortcut; it stays defined until the last of them goes away.
    function defineShortcut(definition: ShortcutDefinition): () => void {
      shortcutDefinitions.set(definition.id, definition);
      shortcutOwners.set(definition.id, (shortcutOwners.get(definition.id) ?? 0) + 1);

      let isDisposed = false;

      return () => {
        if (isDisposed) return;

        isDisposed = true;

        const remaining = (shortcutOwners.get(definition.id) ?? 1) - 1;

        if (remaining > 0) shortcutOwners.set(definition.id, remaining);
        else {
          shortcutOwners.delete(definition.id);
          shortcutDefinitions.delete(definition.id);
        }
      };
    }

    function bindingFor(shortcutId: string): string {
      return preferences.shortcutOverrides[shortcutId] ?? config.shortcuts?.[shortcutId] ?? shortcutDefinitions.get(shortcutId)?.defaultBinding ?? '';
    }

    function shortcutLabel(shortcutId: string): string {
      const binding = bindingFor(shortcutId);

      return binding === '' ? '' : formatBinding(binding, os);
    }

    function onShortcut(shortcutId: string, run: (event: KeyboardEvent) => void, windowId: string | null = null): () => void {
      const handler: ShortcutHandler = { shortcutId, windowId, run };

      shortcutHandlers.push(handler);

      return () => {
        const index = shortcutHandlers.indexOf(handler);

        if (index >= 0) shortcutHandlers.splice(index, 1);
      };
    }

    // Window-scoped handlers of the focused window win over global ones, so an app can take over a shortcut while it is in front.
    function handleKeydown(event: KeyboardEvent): void {
      if (ui.recordingShortcutId !== null || event.defaultPrevented) return;

      const focusedId = focusedWindow.value?.id ?? null;

      for (const definition of shortcutDefinitions.values()) {
        const binding = bindingFor(definition.id);

        if (binding === '' || !matchesBinding(binding, event, os)) continue;
        if (isEditableTarget(event.target) && !/(ctrl|alt|mod|meta|cmd)\+/i.test(binding)) continue;

        const candidates = shortcutHandlers.filter((handler) => handler.shortcutId === definition.id);
        const handler = candidates.find((candidate) => candidate.windowId !== null && candidate.windowId === focusedId) ?? candidates.find((candidate) => candidate.windowId === null);

        if (!handler) continue;

        event.preventDefault();
        handler.run(event);

        return;
      }
    }

    function openWindow(appId: string, options: Parameters<typeof windows.open>[1] = {}) {
      ui.isLauncherOpen = false;
      ui.isPaletteOpen = false;

      return windows.open(appId, options);
    }

    function addCloseGuard(windowId: string, guard: CloseGuard): () => void {
      const guards = closeGuards.get(windowId) ?? new Set<CloseGuard>();

      guards.add(guard);
      closeGuards.set(windowId, guards);

      return () => void guards.delete(guard);
    }

    function openDialog(kind: DialogRequest['kind'], options: DialogOptions, windowId: string | null): Promise<string | boolean | null> {
      return new Promise((resolve) => {
        dialogs.push({
          id: nextId('dialog'),
          kind,
          tone: options.tone ?? 'default',
          title: options.title,
          message: options.message ?? '',
          windowId,
          placeholder: options.placeholder ?? '',
          cancelLabel: options.cancelLabel ?? t('dialog.cancel'),
          confirmLabel: options.confirmLabel ?? t('dialog.ok'),
          defaultValue: options.defaultValue ?? '',
          resolve,
        });
      });
    }

    function settleDialog(dialogId: string, value: string | boolean | null): void {
      const index = dialogs.findIndex((dialog) => dialog.id === dialogId);
      const dialog = dialogs[index];

      if (!dialog) return;

      dialogs.splice(index, 1);
      dialog.resolve(value);
    }

    const dialog = {
      alert: (options: DialogOptions, windowId: string | null = null) => openDialog('alert', options, windowId).then(() => undefined),
      confirm: (options: DialogOptions, windowId: string | null = null) => openDialog('confirm', options, windowId).then((value) => value === true),
      prompt: (options: DialogOptions, windowId: string | null = null) => openDialog('prompt', options, windowId).then((value) => (typeof value === 'string' ? value : null)),
    };

    async function requestClose(windowId: string): Promise<boolean> {
      const desktopWindow = windows.find(windowId);

      if (!desktopWindow) return true;

      const guards = [...(closeGuards.get(windowId) ?? [])];

      for (const guard of guards) {
        if (!(await guard())) return false;
      }

      if (guards.length === 0 && desktopWindow.isDirty) {
        windows.focus(windowId);

        const isDiscarded = await dialog.confirm(
          {
            tone: 'danger',
            title: t('dialog.discardTitle'),
            message: t('dialog.discardMessage', { title: desktopWindow.title }),
            cancelLabel: t('dialog.keepEditing'),
            confirmLabel: t('dialog.discard'),
          },
          windowId,
        );

        if (!isDiscarded) return false;
      }

      closeGuards.delete(windowId);
      windowMenus.delete(windowId);
      windows.close(windowId);

      return true;
    }

    async function requestCloseApp(appId: string): Promise<void> {
      for (const desktopWindow of windows.windowsForApp(appId)) await requestClose(desktopWindow.id);
    }

    const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

    function dismissToast(toastId: string): void {
      const index = toasts.findIndex((toast) => toast.id === toastId);

      if (index >= 0) toasts.splice(index, 1);

      clearTimeout(toastTimers.get(toastId));
      toastTimers.delete(toastId);
    }

    function notify(options: NotifyOptions): XboNotification {
      const notification: XboNotification = {
        id: nextId('notification'),
        icon: options.icon ? markRaw(options.icon) : null,
        tone: options.tone ?? 'info',
        body: options.body ?? '',
        title: options.title,
        appId: options.appId ?? null,
        createdAt: Date.now(),
        actions: options.actions ?? [],
        isRead: false,
      };

      if (!options.isTransient) {
        notifications.unshift(notification);
        notifications.splice(100);
      }

      if (!preferences.isDoNotDisturbOn || options.isTransient) {
        const toastId = nextId('toast');
        const duration = options.duration ?? (notification.tone === 'danger' ? 8000 : 5000);

        toasts.push({ id: toastId, notification });
        toasts.splice(0, Math.max(0, toasts.length - 4));

        if (duration > 0) toastTimers.set(toastId, setTimeout(() => dismissToast(toastId), duration));
      }

      return notification;
    }

    const unreadCount = computed(() => notifications.filter((notification) => !notification.isRead).length);

    function markAllRead(): void {
      for (const notification of notifications) notification.isRead = true;
    }

    function removeNotification(notificationId: string): void {
      const index = notifications.findIndex((notification) => notification.id === notificationId);

      if (index >= 0) notifications.splice(index, 1);
    }

    function clearNotifications(): void {
      notifications.splice(0);
    }

    function registerMenu(menu: MenuDefinition): () => void {
      menus.push(menu);

      return () => {
        const index = menus.indexOf(menu);

        if (index >= 0) menus.splice(index, 1);
      };
    }

    function registerStatusItem(component: Component): () => void {
      const item = { id: nextId('status'), component: markRaw(component) };

      statusItems.push(item);

      return () => {
        const index = statusItems.indexOf(item);

        if (index >= 0) statusItems.splice(index, 1);
      };
    }

    function registerSettingsSection(input: SettingsSectionInput): () => void {
      const section = defineSettingsSection(input);

      settingsSections.push(section);

      return () => {
        const index = settingsSections.indexOf(section);

        if (index >= 0) settingsSections.splice(index, 1);
      };
    }

    const focusedMenus = computed<MenuDefinition[]>(() => {
      const focused = focusedWindow.value;
      const app = focused ? findApp(focused.appId) : undefined;

      if (!focused || !app) return [];

      return [...(app.menus?.({ windowId: focused.id, params: focused.params }) ?? []), ...(windowMenus.get(focused.id) ?? [])];
    });

    function openSettings(section?: string): void {
      openWindow(builtInAppIds.settings, section ? { params: { section } } : {});
    }

    function parseHash(hash: string): StartupWindow | null {
      const match = /^#\/([^?]+)(?:\?(.*))?$/.exec(hash);

      if (!match?.[1]) return null;

      const appId = decodeURIComponent(match[1]);
      const params: WindowParams = Object.fromEntries(new URLSearchParams(match[2] ?? ''));

      return findApp(appId) ? { appId, params } : null;
    }

    function hashFor(appId: string, params: WindowParams): string {
      const query = new URLSearchParams(params).toString();

      return `#/${encodeURIComponent(appId)}${query ? `?${query}` : ''}`;
    }

    // Startup order: restore the last session, then honour a deep link, then open the configured apps if nothing is open.
    async function start(): Promise<void> {
      const isRoutingOn = (config.routing ?? 'hash') === 'hash' && shell.isFullscreen && typeof location !== 'undefined';
      const isRestoreAllowed = config.startup?.isSessionRestored !== false;

      if (isRestoreAllowed && storage) {
        const loadedPreferences = storage.load('preferences');

        if (isPromise(loadedPreferences)) await loadedPreferences;

        const snapshot = await Promise.resolve(storage.load('session'));

        if (preferences.isSessionRestored && snapshot && typeof snapshot === 'object') windows.restoreSession(snapshot as SessionSnapshot);
      }

      const linked = isRoutingOn ? parseHash(location.hash) : null;

      if (linked) openWindow(linked.appId, { params: linked.params });

      if (windowState.windows.length === 0) {
        for (const entry of config.startup?.open ?? []) {
          const startup = typeof entry === 'string' ? { appId: entry } : entry;

          openWindow(startup.appId, startup.params ? { params: startup.params } : {});
        }
      }

      if (isRestoreAllowed && storage) {
        watchDebounced(
          () => JSON.stringify(windows.serializeSession()),
          (snapshot) => void storage.save('session', JSON.parse(snapshot)),
          { debounce: 400 },
        );
      }

      if (isRoutingOn) {
        watch(
          () => (focusedWindow.value ? hashFor(focusedWindow.value.appId, focusedWindow.value.params) : ''),
          (hash) => history.replaceState(history.state, '', hash || location.pathname + location.search),
          { immediate: true },
        );
      }
    }

    const instance = {
      id,
      os,
      ui,
      apps,
      menus,
      brand,
      shell,
      theme,
      groups,
      locale,
      isDark,
      isTauri,
      windows,
      dialogs,
      toasts,
      commands,
      themeCss,
      wallpapers,
      windowMenus,
      chromeStyle,
      preferences,
      statusItems,
      wallpaperCss,
      unreadCount,
      focusedMenus,
      notifications,
      pinnedAppIds,
      appSections,
      rootAttributes,
      runningAppIds,
      focusedWindow,
      isContrastMore,
      isMotionReduced,
      settingsSections,
      shortcutDefinitions,
      isTransparencyReduced,
      account: config.account ? markRaw(config.account) : null,
      helpMenu: config.helpMenu ?? [],
      lockedKeys,
      hiddenKeys,
      config,
      storage,
      t,
      start,
      notify,
      dialog,
      findApp,
      bindingFor,
      togglePin,
      openWindow,
      onShortcut,
      markAllRead,
      registerApp,
      requestClose,
      settleDialog,
      dismissToast,
      registerMenu,
      openSettings,
      setPreference,
      addCloseGuard,
      handleKeydown,
      shortcutLabel,
      defineShortcut,
      registerCommand,
      requestCloseApp,
      resetPreferences,
      removeNotification,
      clearNotifications,
      registerStatusItem,
      registerSettingsSection,
      install(app: App): void {
        app.provide(xboKey, instance as XboInstance);
        app.onUnmount(() => scope.stop());
      },
    };

    return instance;
  })!;
}

export type XboInstance = ReturnType<typeof createXbo>;
