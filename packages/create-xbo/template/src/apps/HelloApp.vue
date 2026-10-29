<script setup lang="ts">
import { ref } from 'vue';
import { XboButton, XboFormField, XboTextField, useCurrentWindow, useNotifications } from '@xbo-ui/vue';

const name = ref('');
const currentWindow = useCurrentWindow();
const notifications = useNotifications();

function greet(): void {
  currentWindow.setTitle(name.value ? `Hello, ${name.value}` : 'Hello');
  notifications.notify({ tone: 'success', title: `Hello, ${name.value || 'there'}` });
}
</script>

<template>
  <form class="hello" @submit.prevent="greet">
    <h2>Welcome</h2>
    <p>Edit <code>src/apps/HelloApp.vue</code>, or press Ctrl K (⌘ K on a Mac) to find everything else.</p>
    <XboFormField label="Your name">
      <XboTextField v-model="name" placeholder="Ada" />
    </XboFormField>
    <XboButton type="submit" variant="primary">Say hello</XboButton>
  </form>
</template>

<style scoped>
.hello {
  display: flex;
  max-width: 420px;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  margin: 0 auto;
  padding: 28px;
}

h2 {
  font-size: 20px;
  font-weight: 600;
}

p {
  color: var(--xbo-ink-muted);
}
</style>
