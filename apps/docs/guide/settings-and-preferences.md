# Settings and preferences

The built-in Settings app (logo menu, Ctrl , or `xbo.openSettings('keyboard')`) has Appearance, Windows, Taskbar and menu bar, Keyboard, Language and region, your sections, and About.

## Defaults, locks and hidden settings

```ts
createXbo({
  apps,
  preferences: {
    defaults: { appearance: 'dark', density: 'comfortable', accent: 'ocean' },
    locked: ['accent'],          // shown, but users cannot change it
    hidden: ['wallpaper'],       // not shown at all
    namespace: 'acme',           // storage key prefix
    storage: myAdapter,          // or null to keep nothing
  },
});
```

Preferences: `appearance`, `accent`, `contrast`, `transparency`, `motion`, `density`, `textScale`, `radius`, `wallpaper`, `windowChrome`, `isBoundsMemoryOn`, `isSessionRestored`, `taskbarPosition`, `taskbarAlignment`, `isTaskbarAutoHidden`, `clock`, `isDoNotDisturbOn`, `pinnedAppIds`, `shortcutOverrides`, `locale`, `hourCycle`.

## Storage

A storage adapter has `load`, `save` and `remove`, each sync or async:

```ts
const serverStorage: StorageAdapter = {
  load: (key) => api.get(`/settings/${key}`),
  save: (key, value) => api.put(`/settings/${key}`, value),
  remove: (key) => api.delete(`/settings/${key}`),
};
```

Built in: `localStorageAdapter(namespace)` (default), `memoryStorageAdapter()`, and `tauriStorage()` from `@xbo-ui/tauri`.

## Your own settings

```ts
createXbo({
  apps,
  settingsSections: [{ id: 'billing', label: 'Billing', icon: BillingIcon, order: 60, component: BillingSettings }],
});

// Inside BillingSettings.vue or any app:
const currency = useAppPreference('billing.currency', 'USD');
```
