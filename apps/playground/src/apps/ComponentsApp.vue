<script setup lang="ts">
import { ref } from 'vue';
import {
  XboAvatar,
  XboBanner,
  XboButton,
  XboButtonGroup,
  XboCheckbox,
  XboCombobox,
  XboContextMenu,
  XboDateField,
  XboDialog,
  XboDisclosure,
  XboDivider,
  XboDropdownMenu,
  XboEmptyState,
  XboFormField,
  XboFormLayout,
  XboIconButton,
  XboKbd,
  XboList,
  XboNumberField,
  XboPopover,
  XboProgressBar,
  XboPropertyList,
  XboRadioGroup,
  XboSearchField,
  XboSegmentedControl,
  XboSelect,
  XboSheet,
  XboSidebar,
  XboSkeleton,
  XboSlider,
  XboSpinner,
  XboSplitButton,
  XboStatusBadge,
  XboStatusBar,
  XboSwitch,
  XboTable,
  XboTabs,
  XboTag,
  XboTextArea,
  XboTextField,
  XboToolbar,
  XboTooltip,
  XboTree,
  useNotifications,
  type TreeNode,
} from '@xbo-ui/vue';
import { RiBellLine, RiFolder3Line, RiStickyNoteLine, RiTestTubeLine } from '../icons';

const notifications = useNotifications();
const toast = (title: string) => notifications.toast({ title });

const section = ref<string | null>('actions');
const view = ref<'list' | 'grid' | 'columns'>('list');
const tab = ref<'general' | 'details' | 'history'>('general');
const name = ref('');
const email = ref('ada@example.com');
const notes = ref('');
const amount = ref('1250.00');
const country = ref<'ke' | 'ug' | 'tz'>();
const city = ref<string>();
const plan = ref<'monthly' | 'yearly'>('monthly');
const dueDate = ref('2026-11-15');
const isSubscribed = ref(true);
const isEnabled = ref(true);
const volume = ref(40);
const query = ref('');
const selectedItem = ref<string | null>('drafts');
const selectedNode = ref<TreeNode>();
const expanded = ref<string[]>(['projects']);
const isDialogOpen = ref(false);
const isSheetOpen = ref(false);
const isBannerShown = ref(true);

const sections = [
  {
    id: 'kit',
    items: [
      { id: 'actions', label: 'Actions' },
      { id: 'inputs', label: 'Inputs' },
      { id: 'data', label: 'Data' },
      { id: 'layout', label: 'Layout' },
      { id: 'feedback', label: 'Feedback' },
    ],
  },
];

const countries = [
  { value: 'ke', label: 'Kenya' },
  { value: 'ug', label: 'Uganda' },
  { value: 'tz', label: 'Tanzania' },
] as const;

const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Kampala', 'Entebbe', 'Arusha', 'Dar es Salaam'].map((label) => ({ value: label.toLowerCase(), label }));

const listItems = [
  { id: 'inbox', label: 'Inbox', detail: '12 unread', icon: RiBellLine },
  { id: 'drafts', label: 'Drafts', detail: '3 notes', icon: RiStickyNoteLine },
  { id: 'archive', label: 'Archive', detail: 'Read only', icon: RiFolder3Line, isDisabled: true },
];

const treeNodes: TreeNode[] = [
  { id: 'projects', label: 'Projects', icon: RiFolder3Line, children: [{ id: 'xbo', label: 'xBO' }, { id: 'docs', label: 'Docs', children: [{ id: 'guides', label: 'Guides' }] }] },
  { id: 'scratch', label: 'Scratch', icon: RiStickyNoteLine },
];

const tableRows = [
  { id: '1', item: 'Design review', hours: 6, rate: 120 },
  { id: '2', item: 'Implementation', hours: 18, rate: 110 },
  { id: '3', item: 'Testing', hours: 5, rate: 95 },
];
</script>

<template>
  <div class="flex h-full">
    <XboSidebar v-model:selected="section" label="Component groups" :sections="sections" width="180px" />
    <div class="flex min-w-0 flex-1 flex-col">
      <XboToolbar label="Gallery toolbar">
        <XboSegmentedControl v-model="view" label="View" :options="[{ value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }, { value: 'columns', label: 'Columns' }]" />
        <span class="xbo-toolbar-spacer" />
        <XboSearchField v-model="query" label="Search the gallery" placeholder="Search" class="w-[200px]" />
        <XboIconButton :icon="RiTestTubeLine" label="Run checks" @click="toast('Checks passed')" />
      </XboToolbar>

      <div class="min-h-0 flex-1 overflow-y-auto">
        <div class="mx-auto flex max-w-[760px] flex-col gap-8 px-8 py-7">
          <template v-if="section === 'actions'">
            <section class="gallery-section">
              <h3>Buttons</h3>
              <div class="flex flex-wrap items-center gap-2">
                <XboButton variant="primary" @click="toast('Saved')">Save</XboButton>
                <XboButton>Cancel</XboButton>
                <XboButton variant="plain">More</XboButton>
                <XboButton variant="danger">Delete</XboButton>
                <XboButton is-loading>Saving</XboButton>
                <XboButton is-disabled>Disabled</XboButton>
                <XboButton size="small">Small</XboButton>
                <XboButton size="large" variant="primary">Large</XboButton>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <XboButtonGroup label="Alignment">
                  <XboButton>Left</XboButton>
                  <XboButton>Centre</XboButton>
                  <XboButton>Right</XboButton>
                </XboButtonGroup>
                <XboSplitButton label="Export" menu-label="More export options" variant="primary" :items="[{ label: 'Export as CSV', run: () => toast('CSV') }, { label: 'Export as PDF', run: () => toast('PDF') }]" @click="toast('Exported')" />
                <XboDropdownMenu :items="[{ label: 'Rename', shortcut: 'F2', run: () => toast('Rename') }, { kind: 'separator' }, { label: 'Duplicate', run: () => toast('Duplicate') }]">
                  <XboButton>Actions</XboButton>
                </XboDropdownMenu>
                <XboTooltip text="Tooltips appear after a short delay">
                  <XboButton variant="plain">Hover me</XboButton>
                </XboTooltip>
              </div>
            </section>
            <section class="gallery-section">
              <h3>Context menu</h3>
              <XboContextMenu :items="[{ label: 'Copy', shortcut: 'Mod+C', run: () => toast('Copied') }, { label: 'Show hidden items', isChecked: true, run: () => toast('Toggled') }, { kind: 'submenu', label: 'Share', items: [{ label: 'Email', run: () => toast('Email') }] }]">
                <div class="grid h-24 place-items-center rounded-md border border-dashed border-field-border text-body text-ink-muted">Right-click here</div>
              </XboContextMenu>
            </section>
          </template>

          <template v-else-if="section === 'inputs'">
            <section class="gallery-section">
              <h3>Form</h3>
              <XboFormLayout :columns="2">
                <XboFormField label="Full name" hint="As it appears on invoices" is-required>
                  <XboTextField v-model="name" placeholder="Ada Lovelace" />
                </XboFormField>
                <XboFormField label="Email" :error="email.includes('@') ? '' : 'Enter an email address with an @'">
                  <XboTextField v-model="email" type="email" />
                </XboFormField>
                <XboFormField label="Amount">
                  <XboNumberField v-model="amount" suffix="KES" min="0" />
                </XboFormField>
                <XboFormField label="Due date">
                  <XboDateField v-model="dueDate" />
                </XboFormField>
                <XboFormField label="Country">
                  <XboSelect v-model="country" :options="countries" placeholder="Choose a country" />
                </XboFormField>
                <XboFormField label="City">
                  <XboCombobox v-model="city" :options="cities" placeholder="Type to search" />
                </XboFormField>
                <XboFormField label="Notes" class="is-wide">
                  <XboTextArea v-model="notes" placeholder="Anything we should know?" />
                </XboFormField>
              </XboFormLayout>
            </section>
            <section class="gallery-section">
              <h3>Choices</h3>
              <XboRadioGroup v-model="plan" label="Billing plan" orientation="horizontal" :options="[{ value: 'monthly', label: 'Monthly', hint: 'Cancel any time' }, { value: 'yearly', label: 'Yearly', hint: 'Two months free' }]" />
              <div class="flex flex-wrap items-center gap-6">
                <XboCheckbox v-model="isSubscribed" label="Email me product news" />
                <label class="flex items-center gap-2 text-body text-ink"><XboSwitch v-model="isEnabled" label="Sync" />Sync</label>
                <div class="flex w-[220px] items-center gap-3"><XboSlider v-model="volume" label="Volume" /><span class="xbo-figures w-8 text-caption text-ink-muted">{{ volume }}</span></div>
              </div>
            </section>
          </template>

          <template v-else-if="section === 'data'">
            <section class="gallery-section">
              <h3>Table</h3>
              <XboTable
                label="Time sheet"
                row-key="id"
                :rows="tableRows"
                :columns="[{ key: 'item', label: 'Item' }, { key: 'hours', label: 'Hours', align: 'end', isNumeric: true }, { key: 'rate', label: 'Rate', align: 'end', isNumeric: true }]"
              />
            </section>
            <section class="gallery-section">
              <h3>List and tree</h3>
              <div class="grid grid-cols-2 gap-4">
                <XboList v-model:selected="selectedItem" label="Mailboxes" :items="listItems" class="rounded-md ring-1 ring-hairline" />
                <XboTree v-model:selected="selectedNode" v-model:expanded="expanded" label="Folders" :nodes="treeNodes" class="rounded-md ring-1 ring-hairline" />
              </div>
            </section>
            <section class="gallery-section">
              <h3>Details</h3>
              <XboPropertyList :items="[{ label: 'Owner', value: 'Ada Lovelace' }, { label: 'Created', value: '2026-10-29', isNumeric: true }, { label: 'Size', value: '1.4 MB', isNumeric: true }]" />
              <div class="flex flex-wrap items-center gap-2">
                <XboAvatar name="Ada Lovelace" />
                <XboAvatar name="Ben Otieno" :size="36" />
                <XboTag label="Draft" />
                <XboTag label="Paid" tone="success" />
                <XboTag label="Overdue" tone="danger" is-removable @remove="toast('Removed')" />
                <XboStatusBadge tone="warning" label="Due soon" />
                <XboKbd binding="palette" />
                <XboKbd binding="Mod+Shift+P" />
              </div>
            </section>
          </template>

          <template v-else-if="section === 'layout'">
            <section class="gallery-section">
              <h3>Tabs</h3>
              <XboTabs v-model="tab" label="Record" :tabs="[{ value: 'general', label: 'General' }, { value: 'details', label: 'Details' }, { value: 'history', label: 'History' }]" class="rounded-md ring-1 ring-hairline">
                <template #general><p class="p-4 text-body text-ink">General settings for the record.</p></template>
                <template #details><p class="p-4 text-body text-ink">More detail.</p></template>
                <template #history><p class="p-4 text-body text-ink">Nothing has changed yet.</p></template>
              </XboTabs>
            </section>
            <section class="gallery-section">
              <h3>Disclosure and divider</h3>
              <XboDisclosure title="Advanced options">
                <p class="text-body text-ink-muted">Hidden until you need them.</p>
              </XboDisclosure>
              <XboDivider label="or" />
              <XboStatusBar>
                <span>3 items selected</span>
                <template #trailing><span>Saved 2 minutes ago</span></template>
              </XboStatusBar>
            </section>
          </template>

          <template v-else>
            <section class="gallery-section">
              <h3>Banners</h3>
              <XboBanner v-if="isBannerShown" tone="warning" title="Your trial ends in 3 days" is-dismissible @dismiss="isBannerShown = false">
                Add a payment method to keep your data.
                <template #actions><XboButton size="small" variant="primary">Add payment method</XboButton></template>
              </XboBanner>
              <XboBanner tone="success" title="All changes saved" />
              <XboBanner tone="danger" title="Sync failed">The server did not respond. Changes are kept on this computer.</XboBanner>
            </section>
            <section class="gallery-section">
              <h3>Progress</h3>
              <XboProgressBar label="Upload" :value="64" />
              <XboProgressBar label="Preparing" />
              <div class="flex items-center gap-3 text-body text-ink-muted"><XboSpinner label="Loading" /> Loading</div>
              <XboSkeleton :lines="3" />
            </section>
            <section class="gallery-section">
              <h3>Overlays</h3>
              <div class="flex flex-wrap gap-2">
                <XboButton @click="isDialogOpen = true">Open dialog</XboButton>
                <XboButton @click="isSheetOpen = true">Open sheet</XboButton>
                <XboPopover width="240px">
                  <template #trigger><XboButton>Popover</XboButton></template>
                  <p class="text-body text-ink">Popovers hold small, focused tasks.</p>
                </XboPopover>
              </div>
            </section>
            <XboEmptyState :icon="RiFolder3Line" title="No files yet" description="Files you add appear here.">
              <XboButton variant="primary" size="small">Add a file</XboButton>
            </XboEmptyState>
          </template>
        </div>
      </div>
    </div>

    <XboDialog v-model:open="isDialogOpen" title="Rename project" description="Names appear in the window title and the taskbar.">
      <XboFormField label="Name"><XboTextField v-model="name" /></XboFormField>
      <template #footer>
        <XboButton @click="isDialogOpen = false">Cancel</XboButton>
        <XboButton variant="primary" @click="isDialogOpen = false">Rename</XboButton>
      </template>
    </XboDialog>
    <XboSheet v-model:open="isSheetOpen" title="Window-modal sheet">
      <p class="text-body text-ink-muted">Only this window is blocked.</p>
      <template #footer><XboButton variant="primary" @click="isSheetOpen = false">Done</XboButton></template>
    </XboSheet>
  </div>
</template>

<style scoped>
.gallery-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gallery-section h3 {
  color: var(--xbo-ink);
  font-size: calc(15px * var(--xbo-text-scale));
  font-weight: 600;
}
</style>
