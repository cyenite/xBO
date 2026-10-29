import { defineComponent, h } from 'vue';
import { useTauriWindow } from './window';

const iconPaths = {
  minimize: 'M4 8.5h8',
  maximize: 'M4.5 4.5h7v7h-7z',
  restore: 'M6 4.5h5.5V10M4.5 6h5.5v5.5H4.5z',
  close: 'M4.5 4.5l7 7m0-7l-7 7',
} as const;

function icon(path: string) {
  return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', 'aria-hidden': 'true' }, [
    h('path', { d: path, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  ]);
}

// Window controls for the native app window when the Tauri window is frameless; renders nothing in a browser.
// Add it to `statusItems` so it sits at the right end of the xBO menu bar.
export default defineComponent({
  name: 'TauriWindowControls',
  setup() {
    const nativeWindow = useTauriWindow();

    return () => {
      if (!nativeWindow.isAvailable) return null;

      const button = (label: string, path: string, onClick: () => Promise<void>) =>
        h('button', { type: 'button', class: 'xbo-button is-plain is-icon is-small', 'aria-label': label, title: label, onClick: () => void onClick() }, [icon(path)]);

      return h('div', { class: 'xbo-tauri-controls', style: 'display:flex;gap:2px;margin-left:6px' }, [
        button('Minimise app', iconPaths.minimize, nativeWindow.minimize),
        button(nativeWindow.isMaximized.value ? 'Restore app' : 'Maximise app', nativeWindow.isMaximized.value ? iconPaths.restore : iconPaths.maximize, nativeWindow.toggleMaximize),
        button('Quit app', iconPaths.close, nativeWindow.close),
      ]);
    };
  },
});
