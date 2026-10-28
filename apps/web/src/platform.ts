export type HostOs = 'macos' | 'windows' | 'linux' | 'other';

interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: { platform?: string };
}

export function detectHostOs(nav: NavigatorWithUserAgentData = navigator): HostOs {
  const platform = (nav.userAgentData?.platform ?? nav.platform ?? nav.userAgent).toLowerCase();

  if (platform.includes('mac')) return 'macos';
  if (platform.includes('win')) return 'windows';
  if (platform.includes('linux')) return 'linux';

  return 'other';
}

export function isDesktopApp(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export const isMacLike = detectHostOs() === 'macos';

export const primaryModifierLabel = isMacLike ? '⌘' : 'Ctrl';

export function hasPrimaryModifier(event: KeyboardEvent | MouseEvent): boolean {
  return isMacLike ? event.metaKey : event.ctrlKey;
}
