import { markRaw, type Component } from 'vue';
import {
  defaultSizeLimits,
  type PreferenceKey,
  type Preferences,
  type Size,
  type StorageAdapter,
  type ThemeOptions,
  type WallpaperKind,
  type WindowParams,
} from '@xbo-ui/core';
import type { Messages } from './i18n';

export interface MenuAction {
  kind?: 'action';
  id?: string;
  icon?: Component;
  label: string;
  shortcut?: string;
  isChecked?: boolean;
  isDisabled?: boolean;
  run: () => void;
}

export interface MenuSeparator {
  kind: 'separator';
}

export interface MenuLabel {
  kind: 'label';
  label: string;
}

export interface MenuSubmenu {
  kind: 'submenu';
  icon?: Component;
  label: string;
  items: MenuEntry[];
}

export type MenuEntry = MenuAction | MenuSeparator | MenuLabel | MenuSubmenu;

export interface MenuDefinition {
  id: string;
  label: string;
  items: MenuEntry[];
}

export interface AppMenuContext {
  windowId: string;
  params: WindowParams;
}

export interface AppDefinition {
  id: string;
  icon: Component | null;
  group: string | null;
  label: string;
  summary: string;
  minSize: Size;
  maxSize: Size | null;
  keywords: string[];
  component: Component;
  defaultSize: Size;
  isPinned: boolean;
  isHidden: boolean;
  isResizable: boolean;
  isSingleInstance: boolean;
  menus: ((context: AppMenuContext) => MenuDefinition[]) | null;
}

export type AppInput = Pick<AppDefinition, 'id' | 'label' | 'component'> & Partial<Omit<AppDefinition, 'id' | 'label' | 'component'>>;

export interface AppGroup {
  id: string;
  label: string;
}

export interface Brand {
  name: string;
  mark: Component | null;
  version: string;
  homepage: string;
  copyright: string;
  description: string;
}

export interface SettingsSection {
  id: string;
  icon: Component | null;
  label: string;
  order: number;
  component: Component;
}

export type SettingsSectionInput = Pick<SettingsSection, 'id' | 'label' | 'component'> & Partial<Pick<SettingsSection, 'icon' | 'order'>>;

export interface WallpaperOption {
  id: string;
  kind: Exclude<WallpaperKind, 'tint'>;
  label: string;
  value: string;
}

export interface LocaleOption {
  value: string;
  label: string;
  messages: Partial<Messages>;
}

export interface StartupWindow {
  appId: string;
  params?: WindowParams;
}

export interface ShellOptions {
  desktopHint: string | null;
  hasMenuBar: boolean;
  hasTaskbar: boolean;
  hasPalette: boolean;
  hasLauncher: boolean;
  isFullscreen: boolean;
  hasNotifications: boolean;
  hasAppearanceToggle: boolean;
  compactWorkspaceWidth: number;
}

export interface PreferenceOptions {
  hidden: PreferenceKey[];
  locked: PreferenceKey[];
  storage: StorageAdapter | null;
  defaults: Partial<Preferences>;
  namespace: string;
}

export interface XboConfig {
  apps: AppInput[];
  menus?: MenuDefinition[];
  theme?: ThemeOptions;
  brand?: Partial<Brand>;
  shell?: Partial<ShellOptions>;
  groups?: AppGroup[];
  account?: Component;
  routing?: 'hash' | 'none';
  helpMenu?: MenuEntry[];
  startup?: { open?: (string | StartupWindow)[]; isSessionRestored?: boolean };
  wallpapers?: WallpaperOption[];
  statusItems?: Component[];
  preferences?: Partial<PreferenceOptions>;
  builtInApps?: { settings?: boolean; about?: boolean };
  shortcuts?: Record<string, string>;
  settingsSections?: SettingsSectionInput[];
  i18n?: { locale?: string; messages?: Partial<Messages>; locales?: LocaleOption[] };
}

export const builtInAppIds = { settings: 'xbo:settings', about: 'xbo:about' } as const;

export function defineApp(input: AppInput): AppDefinition {
  return {
    id: input.id,
    icon: input.icon ? markRaw(input.icon) : null,
    group: input.group ?? null,
    label: input.label,
    summary: input.summary ?? '',
    minSize: input.minSize ?? defaultSizeLimits.minSize,
    maxSize: input.maxSize ?? null,
    keywords: input.keywords ?? [],
    component: markRaw(input.component),
    defaultSize: input.defaultSize ?? { width: 880, height: 580 },
    isPinned: input.isPinned ?? false,
    isHidden: input.isHidden ?? false,
    isResizable: input.isResizable ?? true,
    isSingleInstance: input.isSingleInstance ?? false,
    menus: input.menus ?? null,
  };
}

export function defineSettingsSection(input: SettingsSectionInput): SettingsSection {
  return {
    id: input.id,
    icon: input.icon ? markRaw(input.icon) : null,
    label: input.label,
    order: input.order ?? 100,
    component: markRaw(input.component),
  };
}

export const defaultShellOptions: ShellOptions = {
  desktopHint: null,
  hasMenuBar: true,
  hasTaskbar: true,
  hasPalette: true,
  hasLauncher: true,
  isFullscreen: true,
  hasNotifications: true,
  hasAppearanceToggle: true,
  compactWorkspaceWidth: 760,
};

export const defaultWallpapers: WallpaperOption[] = [
  { id: 'dusk', kind: 'gradient', label: 'Dusk', value: 'linear-gradient(160deg, oklch(0.55 0.08 260), oklch(0.72 0.09 40))' },
  { id: 'lagoon', kind: 'gradient', label: 'Lagoon', value: 'linear-gradient(150deg, oklch(0.5 0.08 200), oklch(0.8 0.07 170))' },
  { id: 'meadow', kind: 'gradient', label: 'Meadow', value: 'linear-gradient(170deg, oklch(0.62 0.09 140), oklch(0.86 0.06 100))' },
  { id: 'graphite', kind: 'solid', label: 'Graphite', value: 'oklch(0.32 0.01 250)' },
  { id: 'paper', kind: 'solid', label: 'Paper', value: 'oklch(0.95 0.01 90)' },
];
