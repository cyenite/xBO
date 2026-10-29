import { createApp } from 'vue';
import { createXbo, defineApp } from '@xbo-ui/vue';
{{tauriImport}}import App from './App.vue';
import HelloApp from './apps/HelloApp.vue';

{{tauriSetup}}const xbo = createXbo({
  brand: { name: '{{title}}', version: '0.1.0' },
  apps: [
    defineApp({
      id: 'hello',
      label: 'Hello',
      summary: 'Your first window.',
      component: HelloApp,
      defaultSize: { width: 560, height: 380 },
      isPinned: true,
    }),
  ],
{{tauriConfig}}  startup: { open: ['hello'] },
});

createApp(App).use(xbo).mount('#app');
