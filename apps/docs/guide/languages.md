# Languages

Every built-in string is a message key. Override some in English, or add whole languages:

```ts
createXbo({
  apps,
  i18n: {
    messages: { 'menu.go': 'Apps' },
    locales: [
      { value: 'fr', label: 'Français', messages: { 'menu.view': 'Présentation', 'taskbar.start': 'Démarrer' } },
    ],
  },
});
```

Users choose a language in Settings when you provide locales. Dates and numbers follow the locale; the clock can be 12- or 24-hour. Use `useI18n().t(key, params)` for the built-in messages and `useFormat()` for dates, times, numbers and currency in your apps.
