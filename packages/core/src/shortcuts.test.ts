import { describe, expect, it } from 'vitest';
import { bindingFromEvent, findBindingConflicts, formatBinding, isBrowserReserved, matchesBinding, normalizeBinding } from './shortcuts';

const press = (key: string, modifiers: Partial<Record<'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey', boolean>> = {}) => ({
  key,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  ...modifiers,
});

describe('shortcuts', () => {
  it('maps Mod to Command on macOS and Ctrl elsewhere', () => {
    expect(matchesBinding('Mod+K', press('k', { metaKey: true }), 'macos')).toBe(true);
    expect(matchesBinding('Mod+K', press('k', { ctrlKey: true }), 'macos')).toBe(false);
    expect(matchesBinding('Mod+K', press('K', { ctrlKey: true }), 'windows')).toBe(true);
  });

  it('requires the exact set of modifiers', () => {
    expect(matchesBinding('Ctrl+Alt+ArrowLeft', press('ArrowLeft', { ctrlKey: true, altKey: true }), 'linux')).toBe(true);
    expect(matchesBinding('Ctrl+Alt+ArrowLeft', press('ArrowLeft', { ctrlKey: true }), 'linux')).toBe(false);
    expect(matchesBinding('Mod+K', press('k', { ctrlKey: true, shiftKey: true }), 'windows')).toBe(false);
  });

  it('accepts key aliases', () => {
    expect(matchesBinding('Ctrl+Esc', press('Escape', { ctrlKey: true }), 'windows')).toBe(true);
  });

  it('formats bindings for each platform', () => {
    expect(formatBinding('Mod+K', 'macos')).toBe('⌘ K');
    expect(formatBinding('Mod+Shift+K', 'windows')).toBe('Ctrl Shift K');
    expect(formatBinding('Ctrl+Alt+ArrowLeft', 'linux')).toBe('Ctrl Alt ←');
    expect(formatBinding('Ctrl+Escape', 'macos')).toBe('⌃ Esc');
  });

  it('normalises equivalent bindings to one form', () => {
    expect(normalizeBinding('shift+mod+k', 'windows')).toBe(normalizeBinding('Ctrl+Shift+K', 'windows'));
  });

  it('flags bindings the browser keeps for itself', () => {
    expect(isBrowserReserved('Ctrl+W', 'windows')).toBe(true);
    expect(isBrowserReserved('Mod+K', 'macos')).toBe(false);
  });

  it('records a binding from a key event and skips bare modifiers', () => {
    expect(bindingFromEvent(press('j', { ctrlKey: true, shiftKey: true }))).toBe('Ctrl+Shift+J');
    expect(bindingFromEvent(press('Shift', { shiftKey: true }))).toBeNull();
  });

  it('finds shortcuts that share a binding', () => {
    const conflicts = findBindingConflicts({ palette: 'Mod+K', search: 'Ctrl+K', close: 'Ctrl+Alt+W', unbound: '' }, 'windows');

    expect([...conflicts.values()]).toEqual([['palette', 'search']]);
  });
});
