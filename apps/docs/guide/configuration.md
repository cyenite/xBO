# Configuration

Everything is passed to `createXbo(config)`. Only `apps` is required.

| Option | Type | Default | What it does |
| --- | --- | --- | --- |
| `apps` | `AppInput[]` | | The windows your app offers. See [Apps and windows](./apps-and-windows). |
| `groups` | `{ id, label }[]` | `[]` | Sections in Start and the Go menu, in this order; apps without a known group go under "Other". |
| `brand` | `{ name, mark, version, description, homepage, copyright }` | `name: 'xBO'` | Shown in the logo menu, About and Start. `mark` is a component. |
| `theme` | `{ preset, accent, light, dark, radius, fonts }` | Harbour | See [Theming](./theming). |
| `shell` | `ShellOptions` | all on | `isFullscreen`, `hasMenuBar`, `hasTaskbar`, `hasLauncher`, `hasPalette`, `hasNotifications`, `hasAppearanceToggle`, `desktopHint`, `compactWorkspaceWidth` (windows open maximised below this width, 760). |
| `menus` | `MenuDefinition[]` | `[]` | Extra top-level menus, shown after the focused app's menus. |
| `helpMenu` | `MenuEntry[]` | `[]` | Entries at the top of the Help menu. |
| `statusItems` | `Component[]` | `[]` | Components on the right of the menu bar (sync state, connection, user). |
| `account` | `Component` | | One more slot on the right, for an account or organisation switcher. |
| `shortcuts` | `Record<id, binding>` | | Your own defaults for built-in shortcuts; users can still rebind them. |
| `preferences` | `{ defaults, locked, hidden, storage, namespace }` | | See [Settings and preferences](./settings-and-preferences). |
| `settingsSections` | `SettingsSectionInput[]` | `[]` | Your pages in the Settings app. |
| `wallpapers` | `WallpaperOption[]` | five built in | Solid colours, gradients or images users can pick. |
| `startup` | `{ open, isSessionRestored }` | restore on | Apps to open when nothing was restored; `isSessionRestored: false` turns session saving off. |
| `routing` | `'hash' \| 'none'` | `'hash'` | Deep links such as `#/notes?id=42` (fullscreen desktops only). |
| `i18n` | `{ locale, messages, locales }` | English | See [Languages](./languages). |
| `builtInApps` | `{ settings, about }` | both on | Leave out the built-in Settings or About app. |

Startup order: the saved session is restored, then a deep link is opened, then `startup.open` runs if no window is open.
