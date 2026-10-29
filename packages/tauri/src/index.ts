import { markRaw, type Component } from 'vue';
import { isTauriRuntime, type StorageAdapter } from '@xbo-ui/core';
import { tauriStorage, type TauriStorageOptions } from './storage';
import TauriWindowControls from './TauriWindowControls';

export { tauriStorage, type TauriStorageOptions } from './storage';
export { openExternal, useTauriWindow, type NativeWindow } from './window';
export { TauriWindowControls };

export interface TauriConfigOptions extends TauriStorageOptions {
  hasWindowControls?: boolean;
}

export interface TauriConfigPart {
  statusItems: Component[];
  preferences: { storage: StorageAdapter } | Record<string, never>;
}

// Spread into createXbo's config; in a browser it contributes nothing, so one config serves web and desktop.
export function tauriConfig(options: TauriConfigOptions = {}): TauriConfigPart {
  if (!isTauriRuntime()) return { statusItems: [], preferences: {} };

  return {
    statusItems: options.hasWindowControls === false ? [] : [markRaw(TauriWindowControls)],
    preferences: { storage: tauriStorage(options) },
  };
}
