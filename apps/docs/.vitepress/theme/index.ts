import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import DemoDesktop from './DemoDesktop.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DemoDesktop', DemoDesktop);
  },
} satisfies Theme;
