export const hostOperatingSystems = [
  { value: 'macos', label: 'macOS' },
  { value: 'windows', label: 'Windows' },
  { value: 'linux', label: 'Linux' },
  { value: 'other', label: 'Other' },
] as const;

export type HostOs = (typeof hostOperatingSystems)[number]['value'];

export interface NavigatorLike {
  platform?: string;
  userAgent: string;
  userAgentData?: { platform?: string };
}

export function detectHostOs(nav: NavigatorLike | null = globalThis.navigator ?? null): HostOs {
  if (!nav) return 'other';

  const platform = (nav.userAgentData?.platform || nav.platform || nav.userAgent).toLowerCase();

  if (platform.includes('mac')) return 'macos';
  if (platform.includes('win')) return 'windows';
  if (platform.includes('linux')) return 'linux';

  return 'other';
}

export function hostOsLabel(os: HostOs): string {
  return hostOperatingSystems.find((candidate) => candidate.value === os)?.label ?? 'Other';
}

export function isTauriRuntime(target: object | undefined = globalThis.window): boolean {
  return target !== undefined && '__TAURI_INTERNALS__' in target;
}

export function isMacLike(os: HostOs): boolean {
  return os === 'macos';
}

export function hasPrimaryModifier(event: Pick<KeyboardEvent, 'ctrlKey' | 'metaKey'>, os: HostOs): boolean {
  return isMacLike(os) ? event.metaKey : event.ctrlKey;
}
