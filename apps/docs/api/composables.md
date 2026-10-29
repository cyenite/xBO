# Composables

| Composable | Returns |
| --- | --- |
| `useXbo()` | The instance created by `createXbo()`. |
| `useWindows()` | `list`, `focused`, `open(appId, { params, isNewWindow, title, state })`, `close`, `closeApp`, `focus`, `minimize`, `maximize`, `restore`, `snap`, `cycle`, `minimizeAll`. |
| `useCurrentWindow()` | Inside a window: `id`, `window`, `params`, `isFocused`, `setTitle`, `setBadge`, `setDirty`, `setParams`, `setState`, `setMenus`, `onBeforeClose`, `onShortcut`, `close`, `focus`, `minimize`, `toggleMaximize`, `alert`, `confirm`, `prompt`. |
| `useCommands()` | `list`, `register(command)`, `openPalette()`. |
| `useShortcut(id, run, { binding, label, scope })` | Defines (with `binding`) or handles a shortcut; returns a disposer. |
| `useNotifications()` | `list`, `unreadCount`, `notify`, `toast`, `remove`, `clear`, `markAllRead`. |
| `useDialog()` | `alert`, `confirm`, `prompt`. |
| `usePreferences()` | `values`, `set(key, value)`, `reset()`, `isLocked(key)`, `isHidden(key)`. |
| `useAppPreference(key, fallback)` | A ref saved with the desktop's storage adapter. |
| `useTheme()` | `theme`, `isDark`, `isContrastMore`, `toggleAppearance()`. |
| `usePlatform()` | `os`, `osLabel`, `isTauri`, `formatBinding(binding)`. |
| `useI18n()` | `t(key, params)`, `locale`. |
| `useFormat()` | `date`, `time`, `number`, `currency`, `relative`, following the user's language and clock. |

Registrations made in a component's `setup` are removed when the component unmounts.

From `@xbo-ui/core` (re-exported): `createTheme`, `themeToCss`, `contrastRatio`, `parseColor`, `formatBinding`, `matchesBinding`, `rankSearchables`, `normalizePreferences`, `localStorageAdapter`, `memoryStorageAdapter`, the geometry helpers and the window manager.
