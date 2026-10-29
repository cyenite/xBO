# @xbo-ui/tauri

[Tauri 2](https://tauri.app) integration for [xBO](https://github.com/cyenite/xBO).

```ts
import { createXbo } from '@xbo-ui/vue';
import { tauriConfig } from '@xbo-ui/tauri';

const tauri = tauriConfig();

const xbo = createXbo({
  apps,
  statusItems: [...tauri.statusItems],
  preferences: { ...tauri.preferences },
});
```

In the desktop app this stores preferences, window sizes and the session with the Tauri store plugin and adds window controls for a frameless native window (`"decorations": false`) to the menu bar, which also becomes the drag region. In a browser it adds nothing, so one configuration serves both.

Also exported: `tauriStorage()`, `useTauriWindow()`, `openExternal(url)` and `TauriWindowControls`.

Rust side: add `tauri-plugin-store` and `tauri-plugin-opener`, and allow `core:window:allow-minimize`, `allow-toggle-maximize`, `allow-close`, `allow-start-dragging`, `allow-is-maximized`, `store:default` and `opener:default` in your capability.

MIT licensed.
