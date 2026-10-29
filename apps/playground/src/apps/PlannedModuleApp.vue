<script setup lang="ts">
import { computed } from 'vue';
import { findApp } from './catalog';

const props = defineProps<{
  appId: string;
  windowId: string;
}>();

const app = computed(() => findApp(props.appId));
</script>

<template>
  <div v-if="app" class="h-full overflow-y-auto">
    <div class="mx-auto flex max-w-[720px] flex-col gap-6 px-8 pt-8 pb-10">
      <header class="flex items-start gap-4">
        <span class="grid size-12 shrink-0 place-items-center rounded-lg bg-primary-soft">
          <component :is="app.icon" width="24" height="24" class="text-primary" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-display font-semibold text-ink">{{ app.label }}</h3>
            <span v-if="app.phase" class="rounded-xs bg-chrome px-1.5 text-caption font-medium text-ink-muted ring-1 ring-hairline">
              Planned, {{ app.phase }}
            </span>
          </div>
          <p class="mt-1 max-w-[62ch] text-body text-ink-muted">{{ app.summary }}</p>
        </div>
      </header>

      <section v-for="workflow in app.plannedWorkflows" :key="workflow.title" class="rounded-md bg-window ring-1 ring-hairline">
        <h4 class="border-b border-hairline px-5 py-3 text-title font-semibold text-ink">{{ workflow.title }}</h4>
        <ol class="flex flex-col gap-3 px-5 py-4">
          <li v-for="(step, index) in workflow.steps" :key="step" class="flex gap-3">
            <span class="figures grid size-6 shrink-0 place-items-center rounded-full bg-chrome text-caption font-semibold text-ink-muted ring-1 ring-hairline">
              {{ index + 1 }}
            </span>
            <span class="pt-0.5 text-body text-ink">{{ step }}</span>
          </li>
        </ol>
      </section>

      <p class="text-caption text-ink-muted">
        This window becomes the working {{ app.label.toLowerCase() }} screen when its module ships. The order of delivery is set in
        <span class="selectable font-medium text-ink">docs/DEVELOPMENT_PLAN.md</span>.
      </p>
    </div>
  </div>
</template>
