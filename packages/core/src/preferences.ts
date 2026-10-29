import { radiusScales, themePresets } from './theme';

export const appearanceOptions = [
  { value: 'system', label: 'Match system' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

export const contrastOptions = [
  { value: 'system', label: 'Match system' },
  { value: 'standard', label: 'Standard' },
  { value: 'more', label: 'Increased' },
] as const;

export const transparencyOptions = [
  { value: 'system', label: 'Match system' },
  { value: 'reduced', label: 'Reduce transparency' },
] as const;

export const motionOptions = [
  { value: 'system', label: 'Match system' },
  { value: 'reduced', label: 'Reduce motion' },
] as const;

export const densityOptions = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
] as const;

export const textScaleOptions = [
  { value: '90', label: 'Smaller' },
  { value: '100', label: 'Default' },
  { value: '110', label: 'Larger' },
  { value: '120', label: 'Large' },
  { value: '130', label: 'Largest' },
] as const;

export const windowChromeOptions = [
  { value: 'auto', label: 'Match my computer' },
  { value: 'macos', label: 'macOS' },
  { value: 'windows', label: 'Windows' },
] as const;

export const taskbarPositionOptions = [
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
] as const;

export const taskbarAlignmentOptions = [
  { value: 'center', label: 'Centre' },
  { value: 'start', label: 'Start' },
] as const;

export const clockOptions = [
  { value: 'time', label: 'Time' },
  { value: 'date-time', label: 'Date and time' },
  { value: 'hidden', label: 'Hidden' },
] as const;

export const hourCycleOptions = [
  { value: 'locale', label: 'Match language' },
  { value: 'h23', label: '24-hour' },
  { value: 'h12', label: '12-hour' },
] as const;

// 'brand' resolves to the accent the developer configured, or Harbour when there is none.
export const accentOptions = [{ value: 'brand', label: 'Brand colour' }, ...themePresets.map(({ value, label }) => ({ value, label }))] as const;

export const wallpaperKinds = [
  { value: 'tint', label: 'Accent tint' },
  { value: 'solid', label: 'Solid colour' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'image', label: 'Image' },
] as const;

type OptionValue<T extends readonly { value: string }[]> = T[number]['value'];

export type AppearancePreference = OptionValue<typeof appearanceOptions>;
export type ContrastPreference = OptionValue<typeof contrastOptions>;
export type TransparencyPreference = OptionValue<typeof transparencyOptions>;
export type MotionPreference = OptionValue<typeof motionOptions>;
export type DensityPreference = OptionValue<typeof densityOptions>;
export type TextScalePreference = OptionValue<typeof textScaleOptions>;
export type WindowChromePreference = OptionValue<typeof windowChromeOptions>;
export type TaskbarPosition = OptionValue<typeof taskbarPositionOptions>;
export type TaskbarAlignment = OptionValue<typeof taskbarAlignmentOptions>;
export type ClockPreference = OptionValue<typeof clockOptions>;
export type HourCyclePreference = OptionValue<typeof hourCycleOptions>;
export type WallpaperKind = OptionValue<typeof wallpaperKinds>;
export type AccentPreference = OptionValue<typeof accentOptions>;
export type RadiusPreference = OptionValue<typeof radiusScales>;
export type WindowChromeStyle = Exclude<WindowChromePreference, 'auto'>;

export interface Wallpaper {
  kind: WallpaperKind;
  value: string;
}

export interface Preferences {
  clock: ClockPreference;
  accent: AccentPreference;
  locale: string;
  motion: MotionPreference;
  radius: RadiusPreference;
  density: DensityPreference;
  contrast: ContrastPreference;
  hourCycle: HourCyclePreference;
  textScale: TextScalePreference;
  appearance: AppearancePreference;
  windowChrome: WindowChromePreference;
  transparency: TransparencyPreference;
  taskbarPosition: TaskbarPosition;
  taskbarAlignment: TaskbarAlignment;
  wallpaper: Wallpaper;
  pinnedAppIds: string[] | null;
  shortcutOverrides: Record<string, string>;
  isTaskbarAutoHidden: boolean;
  isDoNotDisturbOn: boolean;
  isSessionRestored: boolean;
  isBoundsMemoryOn: boolean;
}

export type PreferenceKey = keyof Preferences;

export const defaultPreferences: Preferences = {
  clock: 'time',
  accent: 'brand',
  locale: '',
  motion: 'system',
  radius: 'default',
  density: 'compact',
  contrast: 'system',
  hourCycle: 'locale',
  textScale: '100',
  appearance: 'system',
  windowChrome: 'auto',
  transparency: 'system',
  taskbarPosition: 'bottom',
  taskbarAlignment: 'center',
  wallpaper: { kind: 'tint', value: '' },
  pinnedAppIds: null,
  shortcutOverrides: {},
  isTaskbarAutoHidden: false,
  isDoNotDisturbOn: false,
  isSessionRestored: true,
  isBoundsMemoryOn: true,
};

const enumeratedPreferences: Partial<Record<PreferenceKey, readonly { value: string }[]>> = {
  clock: clockOptions,
  accent: accentOptions,
  motion: motionOptions,
  radius: radiusScales,
  density: densityOptions,
  contrast: contrastOptions,
  hourCycle: hourCycleOptions,
  textScale: textScaleOptions,
  appearance: appearanceOptions,
  windowChrome: windowChromeOptions,
  transparency: transparencyOptions,
  taskbarPosition: taskbarPositionOptions,
  taskbarAlignment: taskbarAlignmentOptions,
};

function isValidValue(key: PreferenceKey, value: unknown, fallback: unknown): boolean {
  const options = enumeratedPreferences[key];

  if (options) return options.some((option) => option.value === value);
  if (key === 'pinnedAppIds') return value === null || (Array.isArray(value) && value.every((item) => typeof item === 'string'));
  if (key === 'wallpaper') {
    const wallpaper = value as Partial<Wallpaper> | null;

    return typeof wallpaper === 'object' && wallpaper !== null && wallpaperKinds.some((kind) => kind.value === wallpaper.kind) && typeof wallpaper.value === 'string';
  }
  if (key === 'shortcutOverrides') {
    return typeof value === 'object' && value !== null && Object.values(value).every((binding) => typeof binding === 'string');
  }

  return typeof value === typeof fallback;
}

// Stored data comes from older versions or other tabs; anything unknown or malformed falls back to the default.
export function normalizePreferences(stored: unknown, defaults: Preferences = defaultPreferences): Preferences {
  const source = typeof stored === 'object' && stored !== null ? (stored as Record<string, unknown>) : {};
  const result = { ...defaults } as Record<PreferenceKey, unknown>;

  for (const key of Object.keys(defaults) as PreferenceKey[]) {
    if (key in source && isValidValue(key, source[key], defaults[key])) result[key] = source[key];
  }

  return result as unknown as Preferences;
}

export function optionsFor(key: PreferenceKey): readonly { value: string; label: string }[] | undefined {
  return enumeratedPreferences[key] as readonly { value: string; label: string }[] | undefined;
}
