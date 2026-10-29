# Component kit

All components are exported from `@xbo-ui/vue`, follow the user's theme, density and text size, and work from the keyboard. Overlays render inside the desktop so menus and dialogs share its theme.

<DemoDesktop demo="components" height="480px" />

| Group | Components |
| --- | --- |
| Actions | `XboButton` (primary, secondary, plain, danger; small, medium, large; loading), `XboIconButton`, `XboButtonGroup`, `XboSplitButton`, `XboToolbar`, `XboDropdownMenu`, `XboContextMenu` |
| Inputs | `XboFormField` (label, hint, error, required), `XboFormLayout`, `XboTextField`, `XboTextArea`, `XboSearchField`, `XboNumberField` (exact decimal strings), `XboDateField`, `XboSelect`, `XboCombobox`, `XboCheckbox`, `XboRadioGroup`, `XboSwitch`, `XboSlider`, `XboSegmentedControl` |
| Data | `XboDataGrid`, `XboTable`, `XboList`, `XboTree`, `XboPropertyList`, `XboStatusBadge`, `XboTag`, `XboAvatar`, `XboKbd` |
| Layout | `XboSplitView`, `XboSidebar`, `XboInspector`, `XboTabs`, `XboDisclosure`, `XboScrollArea`, `XboDivider`, `XboStatusBar` |
| Feedback | `XboDialog`, `XboSheet`, `XboPopover`, `XboTooltip`, `XboBanner`, `XboProgressBar`, `XboSpinner`, `XboEmptyState`, `XboSkeleton` |

## Data grid

<DemoDesktop demo="grid" height="460px" />

```vue
<XboDataGrid
  v-model:selection="selection"
  v-model:hidden-columns="hidden"
  selection-mode="multiple"
  :rows="rows"
  :columns="columns"
  row-key="id"
  label="Tasks"
  @edit="({ row, key, value }) => save(row, key, value)"
/>
```

- Sort by clicking a header; resize by dragging its edge (double-click resets); reorder by dragging headers; show or hide columns from the header's right-click menu.
- Arrow keys, Page Up and Down, Home and End move; Shift extends, Space toggles and Ctrl A selects all in multiple mode; Enter activates.
- Columns with `isEditable` edit in place with F2 or a double-click; Enter commits and Esc cancels.
- Ctrl C copies the selected rows as tab-separated text, ready to paste into a spreadsheet.
- Lists longer than 200 rows render only what is visible.
