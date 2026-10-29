# Desktop apps with Tauri

```bash
pnpm add @xbo-ui/tauri @tauri-apps/api @tauri-apps/plugin-store
```

```ts
import { tauriConfig } from '@xbo-ui/tauri';

const tauri = tauriConfig();

const xbo = createXbo({
  apps,
  statusItems: [...tauri.statusItems],
  preferences: { ...tauri.preferences },
});
```

In the desktop app this stores preferences, window sizes and the session in the app data directory and adds native window controls for a frameless window. The menu bar becomes the window's drag region. In a browser it adds nothing.

Rust side (`src-tauri`):

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_store::Builder::default().build())
    .plugin(tauri_plugin_opener::init())
```

Set `"decorations": false` on the window and allow `core:window:allow-minimize`, `allow-toggle-maximize`, `allow-close`, `allow-start-dragging`, `allow-is-maximized`, `store:default` and `opener:default` in your capability. `openExternal(url)` opens links in the user's browser.
