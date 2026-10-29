<script setup lang="ts">
import { computed } from 'vue';
import { hostOsLabel } from '@xbo-ui/core';
import { useXbo } from '../composables';
import XboMark from '../shell/XboMark.vue';

const xbo = useXbo();

const mark = computed(() => xbo.brand.mark ?? XboMark);
const runtime = computed(() => xbo.t(xbo.isTauri ? 'about.desktopApp' : 'about.browser'));
const isBuiltWithShown = computed(() => xbo.brand.name !== 'xBO');
</script>

<template>
  <div class="xb:flex xb:flex-col xb:items-center xb:gap-4 xb:px-8 xb:text-center">
    <component :is="mark" class="xb:size-16" />
    <div>
      <h3 class="xb:text-display xb:font-semibold xb:text-ink">{{ xbo.brand.name }}</h3>
      <p v-if="xbo.brand.description" class="xb:mt-0.5 xb:text-body xb:text-ink-muted">{{ xbo.brand.description }}</p>
    </div>
    <dl class="xbo-figures xb:grid xb:grid-cols-[auto_auto] xb:gap-x-4 xb:gap-y-1 xb:text-body">
      <template v-if="xbo.brand.version">
        <dt class="xb:text-right xb:text-ink-muted">{{ xbo.t('about.version') }}</dt>
        <dd class="xbo-selectable xb:text-left xb:text-ink">{{ xbo.brand.version }}</dd>
      </template>
      <dt class="xb:text-right xb:text-ink-muted">{{ xbo.t('about.runningAs') }}</dt>
      <dd class="xb:text-left xb:text-ink">{{ runtime }}</dd>
      <dt class="xb:text-right xb:text-ink-muted">{{ xbo.t('about.computer') }}</dt>
      <dd class="xb:text-left xb:text-ink">{{ hostOsLabel(xbo.os) }}</dd>
    </dl>
    <a v-if="xbo.brand.homepage" class="xb:text-body xb:text-primary xb:hover:underline" :href="xbo.brand.homepage" target="_blank" rel="noopener noreferrer">
      {{ xbo.brand.homepage.replace(/^https?:\/\//, '') }}
    </a>
    <p v-if="xbo.brand.copyright" class="xb:text-caption xb:text-ink-subtle">{{ xbo.brand.copyright }}</p>
    <p v-if="isBuiltWithShown" class="xb:text-caption xb:text-ink-subtle">{{ xbo.t('about.builtWith') }}</p>
  </div>
</template>
