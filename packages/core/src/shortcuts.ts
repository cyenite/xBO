import { isMacLike, type HostOs } from './platform';

export interface KeyChord {
  key: string;
  hasAlt: boolean;
  hasCtrl: boolean;
  hasMeta: boolean;
  hasShift: boolean;
  hasPrimary: boolean;
}

export interface ShortcutEventLike {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

const keyAliases: Record<string, string> = {
  esc: 'escape',
  left: 'arrowleft',
  right: 'arrowright',
  up: 'arrowup',
  down: 'arrowdown',
  return: 'enter',
  space: ' ',
  backquote: '`',
};

const keyLabels: Record<string, string> = {
  escape: 'Esc',
  arrowleft: '←',
  arrowright: '→',
  arrowup: '↑',
  arrowdown: '↓',
  enter: '↵',
  ' ': 'Space',
  tab: 'Tab',
  backspace: '⌫',
  delete: 'Del',
};

// Browsers handle these before the page sees them, so an app can never rely on them.
export const browserReservedBindings = [
  'Mod+W',
  'Mod+T',
  'Mod+N',
  'Mod+Q',
  'Mod+Tab',
  'Ctrl+Tab',
  'Mod+Shift+T',
  'Mod+Shift+N',
  'Mod+Shift+W',
  'Ctrl+Shift+Tab',
  'Alt+F4',
] as const;

export function parseBinding(binding: string): KeyChord {
  const parts = binding.split('+').map((part) => part.trim()).filter((part) => part !== '');
  const rawKey = (parts.pop() ?? '').toLowerCase();
  const modifiers = new Set(parts.map((part) => part.toLowerCase()));

  return {
    key: keyAliases[rawKey] ?? rawKey,
    hasAlt: modifiers.has('alt') || modifiers.has('option'),
    hasCtrl: modifiers.has('ctrl') || modifiers.has('control'),
    hasMeta: modifiers.has('meta') || modifiers.has('cmd'),
    hasShift: modifiers.has('shift'),
    hasPrimary: modifiers.has('mod'),
  };
}

function resolveChord(chord: KeyChord, os: HostOs): KeyChord {
  if (!chord.hasPrimary) return chord;

  return isMacLike(os)
    ? { ...chord, hasMeta: true, hasPrimary: false }
    : { ...chord, hasCtrl: true, hasPrimary: false };
}

export function normalizeBinding(binding: string, os: HostOs): string {
  const chord = resolveChord(parseBinding(binding), os);
  const modifiers = [chord.hasCtrl && 'Ctrl', chord.hasAlt && 'Alt', chord.hasShift && 'Shift', chord.hasMeta && 'Meta'].filter(Boolean);

  return [...modifiers, chord.key].join('+');
}

export function matchesBinding(binding: string, event: ShortcutEventLike, os: HostOs): boolean {
  const chord = resolveChord(parseBinding(binding), os);
  const key = event.key.toLowerCase();

  return (
    key === chord.key &&
    event.altKey === chord.hasAlt &&
    event.ctrlKey === chord.hasCtrl &&
    event.metaKey === chord.hasMeta &&
    (event.shiftKey === chord.hasShift || (chord.key.length === 1 && !/[a-z0-9]/.test(chord.key)))
  );
}

export function formatBinding(binding: string, os: HostOs): string {
  const chord = resolveChord(parseBinding(binding), os);
  const keyLabel = keyLabels[chord.key] ?? (chord.key.length === 1 ? chord.key.toUpperCase() : chord.key.replace(/^./, (first) => first.toUpperCase()));

  if (isMacLike(os)) {
    const symbols = [chord.hasCtrl && '⌃', chord.hasAlt && '⌥', chord.hasShift && '⇧', chord.hasMeta && '⌘'].filter(Boolean).join('');

    return symbols === '' ? keyLabel : `${symbols} ${keyLabel}`;
  }

  return [chord.hasCtrl && 'Ctrl', chord.hasAlt && 'Alt', chord.hasShift && 'Shift', chord.hasMeta && 'Win', keyLabel].filter(Boolean).join(' ');
}

export function isBrowserReserved(binding: string, os: HostOs): boolean {
  const normalized = normalizeBinding(binding, os);

  return browserReservedBindings.some((reserved) => normalizeBinding(reserved, os) === normalized);
}

export function bindingFromEvent(event: ShortcutEventLike): string | null {
  const key = event.key;

  if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) return null;

  const modifiers = [event.ctrlKey && 'Ctrl', event.altKey && 'Alt', event.shiftKey && 'Shift', event.metaKey && 'Meta'].filter(Boolean);

  return [...modifiers, key.length === 1 ? key.toUpperCase() : key].join('+');
}

// Returns each binding that more than one shortcut uses, with the ids of the shortcuts that share it.
export function findBindingConflicts(bindings: Record<string, string>, os: HostOs): Map<string, string[]> {
  const byBinding = new Map<string, string[]>();

  for (const [id, binding] of Object.entries(bindings)) {
    if (binding === '') continue;

    const normalized = normalizeBinding(binding, os);

    byBinding.set(normalized, [...(byBinding.get(normalized) ?? []), id]);
  }

  return new Map([...byBinding].filter(([, ids]) => ids.length > 1));
}
