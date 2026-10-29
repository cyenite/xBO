<script setup lang="ts">
import { ref } from 'vue';
import { XboContextMenu, XboSegmentedControl, XboStatusBadge, XboSwitch, useNotifications } from '@xbo-ui/vue';

const notifications = useNotifications();
const view = ref<'list' | 'grid' | 'columns'>('list');
const isEnabled = ref(true);

const viewOptions = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'columns', label: 'Columns' },
] as const;
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div class="mx-auto flex max-w-[720px] flex-col gap-6 px-8 py-7">
      <section class="flex flex-col gap-2">
        <h3 class="text-title font-semibold text-ink">Segmented control</h3>
        <XboSegmentedControl v-model="view" label="View" :options="viewOptions" />
      </section>
      <section class="flex flex-col gap-2">
        <h3 class="text-title font-semibold text-ink">Switch</h3>
        <label class="flex items-center gap-3 text-body text-ink">
          <XboSwitch v-model="isEnabled" label="Enabled" />
          {{ isEnabled ? 'On' : 'Off' }}
        </label>
      </section>
      <section class="flex flex-col gap-2">
        <h3 class="text-title font-semibold text-ink">Status badges</h3>
        <div class="flex flex-wrap gap-2">
          <XboStatusBadge tone="neutral" label="Draft" />
          <XboStatusBadge tone="info" label="Waiting" />
          <XboStatusBadge tone="success" label="Done" />
          <XboStatusBadge tone="warning" label="Due soon" />
          <XboStatusBadge tone="danger" label="Failed" />
        </div>
      </section>
      <section class="flex flex-col gap-2">
        <h3 class="text-title font-semibold text-ink">Context menu</h3>
        <XboContextMenu
          :items="[
            { label: 'Copy', shortcut: 'Mod+C', run: () => notifications.toast({ title: 'Copied' }) },
            { label: 'Show hidden items', isChecked: false, run: () => notifications.toast({ title: 'Toggled' }) },
            { kind: 'separator' },
            { kind: 'submenu', label: 'Share', items: [{ label: 'Email', run: () => notifications.toast({ title: 'Email' }) }] },
          ]"
        >
          <div class="grid h-28 place-items-center rounded-md border border-dashed border-field-border text-body text-ink-muted">Right-click here</div>
        </XboContextMenu>
      </section>
    </div>
  </div>
</template>
