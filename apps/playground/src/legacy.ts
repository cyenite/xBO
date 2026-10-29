import { detectHostOs, hasPrimaryModifier as hasModifier, isTauriRuntime, localStorageAdapter } from '@xbo-ui/core';

const storage = localStorageAdapter('xbo');

export { detectHostOs };
export * from '@xbo-ui/core';

export const isMacLike = detectHostOs() === 'macos';
export const primaryModifierLabel = isMacLike ? '⌘' : 'Ctrl';
export const isDesktopApp = () => isTauriRuntime();
export const hasPrimaryModifier = (event: KeyboardEvent | MouseEvent) => hasModifier(event, detectHostOs());
export const readStored = <T,>(key: string, fallback: T): T => (storage.load(key.replace(/^xbo\./, '')) as T | undefined) ?? fallback;
export const writeStored = (key: string, value: unknown) => storage.save(key.replace(/^xbo\./, ''), value);
