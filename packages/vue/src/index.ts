import './styles/xbo.css';

export * from '@xbo-ui/core';
export { createXbo, xboKey } from './instance';
export type { Command, CloseGuard, DialogOptions, NotificationAction, NotifyOptions, ShortcutDefinition, XboInstance, XboNotification } from './instance';
export { builtInAppIds, defaultShellOptions, defaultWallpapers, defineApp, defineSettingsSection } from './config';
export type {
  AppDefinition,
  AppGroup,
  AppInput,
  AppMenuContext,
  Brand,
  LocaleOption,
  MenuAction,
  MenuDefinition,
  MenuEntry,
  MenuLabel,
  MenuSeparator,
  MenuSubmenu,
  SettingsSection,
  SettingsSectionInput,
  ShellOptions,
  StartupWindow,
  WallpaperOption,
  XboConfig,
} from './config';
export { englishMessages, interpolate } from './i18n';
export type { MessageKey, MessageParams, Messages } from './i18n';
export {
  useAppPreference,
  useCommands,
  useCurrentWindow,
  useDialog,
  useFormat,
  useI18n,
  useNotifications,
  usePlatform,
  usePreferences,
  useShortcut,
  useTheme,
  useWindows,
  useXbo,
  windowIdKey,
} from './composables';
export type { ShortcutOptions } from './composables';
export type { StatusTone } from './components/status';

export { default as XboDesktop } from './shell/XboDesktop.vue';
export { default as XboMark } from './shell/XboMark.vue';
export { default as XboAvatar } from './components/XboAvatar.vue';
export { default as XboBanner } from './components/XboBanner.vue';
export { default as XboButton } from './components/XboButton.vue';
export { default as XboButtonGroup } from './components/XboButtonGroup.vue';
export { default as XboCheckbox } from './components/XboCheckbox.vue';
export { default as XboCombobox } from './components/XboCombobox.vue';
export { default as XboContextMenu } from './components/XboContextMenu.vue';
export { default as XboDataGrid } from './components/XboDataGrid.vue';
export type { GridColumn, GridEdit } from './components/XboDataGrid.vue';
export { default as XboDateField } from './components/XboDateField.vue';
export { default as XboDialog } from './components/XboDialog.vue';
export { default as XboDisclosure } from './components/XboDisclosure.vue';
export { default as XboDivider } from './components/XboDivider.vue';
export { default as XboDropdownMenu } from './components/XboDropdownMenu.vue';
export { default as XboEmptyState } from './components/XboEmptyState.vue';
export { default as XboFormField } from './components/XboFormField.vue';
export { default as XboFormLayout } from './components/XboFormLayout.vue';
export { default as XboIconButton } from './components/XboIconButton.vue';
export { default as XboInspector } from './components/XboInspector.vue';
export { default as XboKbd } from './components/XboKbd.vue';
export { default as XboList } from './components/XboList.vue';
export { default as XboNumberField } from './components/XboNumberField.vue';
export { default as XboPopover } from './components/XboPopover.vue';
export { default as XboProgressBar } from './components/XboProgressBar.vue';
export { default as XboPropertyList } from './components/XboPropertyList.vue';
export { default as XboRadioGroup } from './components/XboRadioGroup.vue';
export { default as XboScrollArea } from './components/XboScrollArea.vue';
export { default as XboSearchField } from './components/XboSearchField.vue';
export { default as XboSegmentedControl } from './components/XboSegmentedControl.vue';
export { default as XboSelect } from './components/XboSelect.vue';
export { default as XboSheet } from './components/XboSheet.vue';
export { default as XboSidebar } from './components/XboSidebar.vue';
export { default as XboSkeleton } from './components/XboSkeleton.vue';
export { default as XboSlider } from './components/XboSlider.vue';
export { default as XboSpinner } from './components/XboSpinner.vue';
export { default as XboSplitButton } from './components/XboSplitButton.vue';
export { default as XboSplitView } from './components/XboSplitView.vue';
export { default as XboStatusBadge } from './components/XboStatusBadge.vue';
export { default as XboStatusBar } from './components/XboStatusBar.vue';
export { default as XboSwitch } from './components/XboSwitch.vue';
export { default as XboTable } from './components/XboTable.vue';
export { default as XboTabs } from './components/XboTabs.vue';
export { default as XboTag } from './components/XboTag.vue';
export { default as XboTextArea } from './components/XboTextArea.vue';
export { default as XboTextField } from './components/XboTextField.vue';
export { default as XboToolbar } from './components/XboToolbar.vue';
export { default as XboTooltip } from './components/XboTooltip.vue';
export { default as XboTree } from './components/XboTree.vue';
export type { TableColumn } from './components/XboTable.vue';
export type { TreeNode } from './components/XboTree.vue';
export type { SidebarItem, SidebarSection } from './components/XboSidebar.vue';
export { addDecimal, compareDecimal, isDecimalInput, normalizeDecimal } from './components/decimal';
