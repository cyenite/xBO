# Notifications and dialogs

```ts
const notifications = useNotifications();

notifications.notify({
  tone: 'success',            // neutral, info, success, warning, danger
  title: 'Invoice sent',
  body: 'INV-42 went to billing@example.com.',
  actions: [{ label: 'Open', run: () => open('invoice', { params: { id: 'INV-42' } }) }],
  duration: 5000,             // 0 keeps the toast until dismissed
});

notifications.toast({ title: 'Copied' }); // a toast that is not kept in the list
```

Notifications go to the list behind the bell in the menu bar, with an unread count. Do not disturb (in Settings and the list) keeps them out of view.

## Dialogs

```ts
const dialog = useDialog();

await dialog.alert({ title: 'Export finished' });
const isDeleted = await dialog.confirm({ tone: 'danger', title: 'Delete 3 files?', confirmLabel: 'Delete' });
const name = await dialog.prompt({ title: 'Rename', defaultValue: 'Untitled' });
```

From inside a window, `useCurrentWindow().confirm()` (and `alert`, `prompt`) shows a sheet that blocks only that window. For custom content use `<XboDialog>` or `<XboSheet>`.
