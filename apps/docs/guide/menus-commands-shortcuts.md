# Menus, commands and shortcuts

## Menus are data

```ts
const menu: MenuDefinition = {
  id: 'edit',
  label: 'Edit',
  items: [
    { label: 'Undo', shortcut: 'Mod+Z', run: undo },
    { kind: 'separator' },
    { label: 'Show ruler', isChecked: isRulerShown.value, run: toggleRuler },
    { kind: 'submenu', label: 'Transform', items: [{ label: 'Upper case', run: upper }] },
  ],
};
```

- `createXbo({ menus })` adds menus for the whole desktop.
- `defineApp({ menus })` adds menus while that app is focused.
- `useCurrentWindow().setMenus([...])` adds menus while that window is focused, and can close over component state.
- `shortcut` names a registered shortcut id (so it follows rebinding) or a literal binding.

The same entries drive `XboDropdownMenu` and `XboContextMenu`.

## Commands

```ts
useCommands().register({
  id: 'invoice:send',
  label: 'Send invoice',
  section: 'Billing',
  keywords: ['email'],
  shortcutId: 'invoice:send',
  run: send,
});
```

Commands appear in the palette (Ctrl K) with apps, open windows and built-in window and view commands, ranked by how well they match.

## Shortcuts

```ts
// Defines a shortcut users can rebind in Settings, scoped to this window.
useShortcut('invoice:send', send, { label: 'Send invoice', binding: 'Mod+Enter', scope: 'window' });
```

Bindings use `Mod` for Command on macOS and Ctrl elsewhere. Window-scoped handlers win while their window is focused. Settings warns about bindings the browser keeps for itself (such as Ctrl W) and about conflicts.
