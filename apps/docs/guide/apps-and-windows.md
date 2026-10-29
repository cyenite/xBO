# Apps and windows

## Defining apps

```ts
defineApp({
  id: 'invoice',
  label: 'Invoice',
  icon: InvoiceIcon,
  group: 'billing',
  summary: 'Create and send invoices.',
  keywords: ['bill', 'receipt'],
  component: InvoiceApp,
  defaultSize: { width: 900, height: 620 },
  minSize: { width: 600, height: 400 },
  maxSize: null,
  isResizable: true,
  isSingleInstance: false,
  isPinned: true,
  isHidden: false,
  menus: ({ windowId, params }) => [],
});
```

- **Several windows**: multi-instance apps open a new window on request (`open(id, { isNewWindow: true })`, the taskbar menu, or Ctrl Alt N).
- **Params**: `open('invoice', { params: { id: 'INV-42' } })` opens one window per distinct params and focuses an existing one for the same params. Params appear in deep links.
- **Single instance**: Settings-style apps reuse their one window.
- **Hidden apps** are not in Start or the Go menu but can be opened by id.

Each app component receives `windowId`, `appId` and `params` as props.

## Inside a window

```ts
const current = useCurrentWindow();

current.setTitle('Invoice INV-42');
current.setBadge('3');
current.setDirty(true);
current.setState({ scrollTop: 120 }); // restored with the session
current.setParams({ id: 'INV-43' });  // updates the deep link
current.onBeforeClose(async () => confirmLeaving());
const isConfirmed = await current.confirm({ title: 'Send invoice?' }); // window-modal sheet
```

A window marked dirty asks "Discard unsaved changes?" before closing unless you add your own close guard.

## Controlling windows

```ts
const windows = useWindows();

windows.open('notes');
windows.snap(id, 'left');      // left, right, top-left, top-right, bottom-left, bottom-right
windows.maximize(id);
windows.minimizeAll();
await windows.close(id);       // runs close guards
```

Users snap by dragging to an edge or corner, from the layout flyout on the maximise button, with Ctrl Alt arrows, or from the Window menu. Bounds are remembered per app and the whole session (windows, positions, params, state) is restored on reload.
