<script setup lang="ts">
import { ref } from 'vue';
import {
  XboBanner,
  XboButton,
  XboCheckbox,
  XboFormField,
  XboFormLayout,
  XboNumberField,
  XboSegmentedControl,
  XboSelect,
  XboSwitch,
  XboTabs,
  XboTag,
  XboTextField,
} from '@xbo-ui/vue';

const tab = ref<'form' | 'status'>('form');
const name = ref('Ada Lovelace');
const amount = ref('1250.00');
const plan = ref<'monthly' | 'yearly'>('monthly');
const region = ref<'eu' | 'us' | 'af'>('af');
const isSubscribed = ref(true);
const isEnabled = ref(true);
</script>

<template>
  <XboTabs v-model="tab" label="Demo" :tabs="[{ value: 'form', label: 'Form' }, { value: 'status', label: 'Status' }]" style="height: 100%">
    <template #form>
      <div style="padding: 20px; max-width: 640px">
        <XboFormLayout :columns="2">
          <XboFormField label="Name"><XboTextField v-model="name" /></XboFormField>
          <XboFormField label="Amount"><XboNumberField v-model="amount" suffix="USD" /></XboFormField>
          <XboFormField label="Region"><XboSelect v-model="region" :options="[{ value: 'af', label: 'Africa' }, { value: 'eu', label: 'Europe' }, { value: 'us', label: 'Americas' }]" /></XboFormField>
          <XboFormField label="Plan"><XboSegmentedControl v-model="plan" label="Plan" :options="[{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }]" /></XboFormField>
        </XboFormLayout>
        <div style="display: flex; gap: 20px; align-items: center; margin-top: 16px">
          <XboCheckbox v-model="isSubscribed" label="Send receipts" />
          <XboSwitch v-model="isEnabled" label="Sync" />
          <XboButton variant="primary">Save</XboButton>
        </div>
      </div>
    </template>
    <template #status>
      <div style="display: flex; flex-direction: column; gap: 12px; padding: 20px; max-width: 640px">
        <XboBanner tone="success" title="All changes saved" />
        <XboBanner tone="warning" title="Trial ends in 3 days">Add a payment method to keep your data.</XboBanner>
        <div style="display: flex; gap: 8px"><XboTag label="Draft" /><XboTag label="Paid" tone="success" /><XboTag label="Overdue" tone="danger" /></div>
      </div>
    </template>
  </XboTabs>
</template>
