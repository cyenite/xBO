import { computed, type Component } from 'vue';
import {
  RiArrowLeftRightLine,
  RiCheckboxBlankLine,
  RiCloseLine,
  RiMoonLine,
  RiSubtractLine,
  RiSunLine,
} from '../icons';
import { apps } from '../apps/catalog';
import { primaryModifierLabel } from '../platform';
import { usePreferencesStore } from '../stores/preferences';
import { useWindowsStore } from '../stores/windows';

export const commandSections = [
  { id: 'apps', label: 'Apps' },
  { id: 'window', label: 'Window' },
  { id: 'view', label: 'View' },
] as const;

export type CommandSectionId = (typeof commandSections)[number]['id'];

export interface ShellCommand {
  id: string;
  icon?: Component;
  label: string;
  detail?: string;
  section: CommandSectionId;
  keywords: string[];
  shortcut?: string;
  run: () => void;
}

export const shortcuts = {
  palette: `${primaryModifierLabel} K`,
  launcher: 'Ctrl Esc',
  snapLeft: 'Ctrl Alt ←',
  snapRight: 'Ctrl Alt →',
  maximize: 'Ctrl Alt ↑',
  minimize: 'Ctrl Alt ↓',
  close: 'Ctrl Alt W',
} as const;

export function useShellCommands() {
  const windows = useWindowsStore();
  const preferences = usePreferencesStore();

  return computed<ShellCommand[]>(() => {
    const focused = windows.focusedWindow;
    const appCommands: ShellCommand[] = apps.map((app) => ({
      id: `open:${app.id}`,
      icon: app.icon,
      label: app.label,
      detail: app.summary,
      section: 'apps',
      keywords: [app.label, ...app.keywords],
      run: () => void windows.open(app.id),
    }));
    const windowCommands: ShellCommand[] = focused
      ? [
          {
            id: 'window:snap-left',
            icon: RiArrowLeftRightLine,
            label: `Snap ${focused.title} to the left`,
            section: 'window',
            keywords: ['snap', 'left', 'tile', 'split'],
            shortcut: shortcuts.snapLeft,
            run: () => windows.snap(focused.id, 'left'),
          },
          {
            id: 'window:snap-right',
            icon: RiArrowLeftRightLine,
            label: `Snap ${focused.title} to the right`,
            section: 'window',
            keywords: ['snap', 'right', 'tile', 'split'],
            shortcut: shortcuts.snapRight,
            run: () => windows.snap(focused.id, 'right'),
          },
          {
            id: 'window:maximize',
            icon: RiCheckboxBlankLine,
            label: focused.mode === 'maximized' ? `Restore ${focused.title}` : `Maximise ${focused.title}`,
            section: 'window',
            keywords: ['maximise', 'maximize', 'zoom', 'full', 'restore'],
            shortcut: shortcuts.maximize,
            run: () => windows.toggleMaximize(focused.id),
          },
          {
            id: 'window:minimize',
            icon: RiSubtractLine,
            label: `Minimise ${focused.title}`,
            section: 'window',
            keywords: ['minimise', 'minimize', 'hide'],
            shortcut: shortcuts.minimize,
            run: () => windows.minimize(focused.id),
          },
          {
            id: 'window:close',
            icon: RiCloseLine,
            label: `Close ${focused.title}`,
            section: 'window',
            keywords: ['close', 'quit'],
            shortcut: shortcuts.close,
            run: () => windows.close(focused.id),
          },
        ]
      : [];
    const viewCommands: ShellCommand[] = [
      {
        id: 'view:theme',
        icon: preferences.isDark ? RiSunLine : RiMoonLine,
        label: preferences.isDark ? 'Switch to light appearance' : 'Switch to dark appearance',
        section: 'view',
        keywords: ['theme', 'dark', 'light', 'appearance', 'mode'],
        run: () => preferences.toggleTheme(),
      },
      {
        id: 'view:chrome',
        icon: RiCheckboxBlankLine,
        label: preferences.chromeStyle === 'macos' ? 'Use Windows window controls' : 'Use macOS window controls',
        section: 'view',
        keywords: ['window controls', 'traffic lights', 'caption buttons', 'macos', 'windows'],
        run: () => (preferences.chrome = preferences.chromeStyle === 'macos' ? 'windows' : 'macos'),
      },
      {
        id: 'view:show-desktop',
        icon: RiSubtractLine,
        label: 'Show desktop',
        section: 'view',
        keywords: ['desktop', 'minimise all', 'hide all'],
        run: () => windows.minimizeAll(),
      },
    ];

    return [...appCommands, ...windowCommands, ...viewCommands];
  });
}

export function scoreCommand(command: ShellCommand, query: string): number {
  const needle = query.trim().toLowerCase();

  if (needle === '') return 1;

  const label = command.label.toLowerCase();

  if (label.startsWith(needle)) return 4;
  if (label.split(/\s+/).some((word) => word.startsWith(needle))) return 3;
  if (label.includes(needle)) return 2;
  if (command.keywords.some((keyword) => keyword.toLowerCase().includes(needle))) return 1;

  return 0;
}
