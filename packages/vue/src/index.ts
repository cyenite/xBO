import './styles/xbo.css';

export * from '@xbo-ui/core';
export { createXbo, xboKey } from './instance';
export type { Command, CloseGuard, DialogOptions, NotificationAction, NotifyOptions, ShortcutDefinition, XboInstance, XboNotification } from './instance';
export { builtInAppIds, defaultShellOptions, defaultWallpapers, defineApp, defineSettingsSection } from './config';
export type {
  AppDefinition,
  AppGroup,
  AppInput,
  AppMenuContext,
  Brand,
  LocaleOption,
  MenuAction,
  MenuDefinition,
  MenuEntry,
  MenuLabel,
  MenuSeparator,
  MenuSubmenu,
  SettingsSection,
  SettingsSectionInput,
  ShellOptions,
  StartupWindow,
  WallpaperOption,
  XboConfig,
} from './config';
export { englishMessages, interpolate } from './i18n';
export type { MessageKey, MessageParams, Messages } from './i18n';
export {
  useAppPreference,
  useCommands,
  useCurrentWindow,
  useDialog,
  useFormat,
  useI18n,
  useNotifications,
  usePlatform,
  usePreferences,
  useShortcut,
  useTheme,
  useWindows,
  useXbo,
  windowIdKey,
} from './composables';
export type { ShortcutOptions } from './composables';
export type { StatusTone } from './components/status';

export { default as XboDesktop } from './shell/XboDesktop.vue';
export { default as XboMark } from './shell/XboMark.vue';
export { default as XboContextMenu } from './components/XboContextMenu.vue';
export { default as XboDataGrid } from './components/XboDataGrid.vue';
export type { GridColumn } from './components/XboDataGrid.vue';
export { default as XboSegmentedControl } from './components/XboSegmentedControl.vue';
export { default as XboStatusBadge } from './components/XboStatusBadge.vue';
export { default as XboSwitch } from './components/XboSwitch.vue';
