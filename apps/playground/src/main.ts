import { createApp } from 'vue';
import { createXbo, defineApp } from '@xbo-ui/vue';
import App from './App.vue';
import ComponentsApp from './apps/ComponentsApp.vue';
import FilesApp from './apps/FilesApp.vue';
import NotesApp from './apps/NotesApp.vue';
import PlaygroundSettings from './apps/PlaygroundSettings.vue';
import WelcomeApp from './apps/WelcomeApp.vue';
import ConnectionStatus from './ConnectionStatus.vue';
import { RiCompass3Line, RiFolder3Line, RiGithubLine, RiLayoutGridLine, RiStickyNoteLine, RiTestTubeLine } from './icons';
import './styles.css';

const xbo = createXbo({
  brand: {
    name: 'xBO playground',
    version: import.meta.env.VITE_XBO_VERSION ?? '0.1.0',
    homepage: 'https://github.com/cyenite/xBO',
    description: 'Every xBO feature in one place.',
    copyright: 'MIT licensed',
  },
  groups: [
    { id: 'start', label: 'Start here' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'reference', label: 'Reference' },
  ],
  apps: [
    defineApp({
      id: 'welcome',
      icon: RiCompass3Line,
      label: 'Welcome',
      group: 'start',
      summary: 'A tour of windows, menus, notifications, dialogs and settings.',
      keywords: ['tour', 'start', 'help'],
      component: WelcomeApp,
      defaultSize: { width: 760, height: 560 },
      isPinned: true,
      isSingleInstance: true,
    }),
    defineApp({
      id: 'notes',
      icon: RiStickyNoteLine,
      label: 'Notes',
      group: 'productivity',
      summary: 'Several windows, unsaved-change guards, window menus and a window shortcut.',
      keywords: ['text', 'editor', 'write'],
      component: NotesApp,
      defaultSize: { width: 620, height: 460 },
      minSize: { width: 420, height: 300 },
      isPinned: true,
      menus: () => [
        {
          id: 'notes:note',
          label: 'Note',
          items: [
            { label: 'New note', shortcut: 'newWindow', run: () => void xbo.openWindow('notes', { isNewWindow: true }) },
            { kind: 'separator' },
            { label: 'Close all notes', run: () => void xbo.requestCloseApp('notes') },
          ],
        },
      ],
    }),
    defineApp({
      id: 'files',
      icon: RiFolder3Line,
      label: 'Files',
      group: 'productivity',
      summary: 'A dense data grid with sorting, keyboard selection and a detail panel.',
      keywords: ['grid', 'table', 'list'],
      component: FilesApp,
      defaultSize: { width: 980, height: 600 },
      isPinned: true,
    }),
    defineApp({
      id: 'components',
      icon: RiLayoutGridLine,
      label: 'Components',
      group: 'reference',
      summary: 'The component kit in every state.',
      keywords: ['kit', 'buttons', 'inputs', 'gallery'],
      component: ComponentsApp,
      defaultSize: { width: 900, height: 620 },
      isPinned: true,
      isSingleInstance: true,
    }),
  ],
  settingsSections: [{ id: 'playground', icon: RiTestTubeLine, label: 'Playground', order: 60, component: PlaygroundSettings }],
  statusItems: [ConnectionStatus],
  helpMenu: [{ icon: RiGithubLine, label: 'xBO on GitHub', run: () => window.open('https://github.com/cyenite/xBO', '_blank', 'noopener') }],
  startup: { open: ['welcome'] },
  preferences: { namespace: 'xbo-playground' },
});

createApp(App).use(xbo).mount('#app');
