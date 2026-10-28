<script setup lang="ts">
import { detectHostOs, isDesktopApp } from '../platform';
import XboMark from '../shell/XboMark.vue';

const version = import.meta.env.VITE_XBO_VERSION ?? '0.1.0';
const runtime = isDesktopApp() ? 'Desktop app' : 'Web browser';
const hostLabels = { macos: 'macOS', windows: 'Windows', linux: 'Linux', other: 'Other' } as const;
const host = hostLabels[detectHostOs()];
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
    <XboMark class="size-16" />
    <div>
      <h3 class="text-display font-semibold text-ink">xBO</h3>
      <p class="mt-0.5 text-body text-ink-muted">Back office for FMCG operations</p>
    </div>
    <dl class="figures grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-body">
      <dt class="text-right text-ink-muted">Version</dt><dd class="selectable text-left text-ink">{{ version }}</dd>
      <dt class="text-right text-ink-muted">Running as</dt><dd class="text-left text-ink">{{ runtime }}</dd>
      <dt class="text-right text-ink-muted">Computer</dt><dd class="text-left text-ink">{{ host }}</dd>
    </dl>
  </div>
</template>
