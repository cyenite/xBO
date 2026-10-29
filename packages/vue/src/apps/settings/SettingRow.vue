<script setup lang="ts">
import { useXbo } from '../../composables';
import { RiInformationLine } from '../../icons';

withDefaults(
  defineProps<{
    label: string;
    hint?: string;
    isLocked?: boolean;
  }>(),
  { hint: '', isLocked: false },
);

const xbo = useXbo();
</script>

<template>
  <div class="setting-row">
    <dt class="xb:min-w-0">
      <span class="xb:text-body xb:text-ink">{{ label }}</span>
      <span v-if="hint" class="xb:block xb:text-caption xb:text-ink-muted">{{ hint }}</span>
      <span v-if="isLocked" class="xb:mt-0.5 xb:flex xb:items-center xb:gap-1 xb:text-caption xb:text-ink-muted">
        <RiInformationLine width="13" height="13" aria-hidden="true" />{{ xbo.t('locked') }}
      </span>
    </dt>
    <dd class="xb:min-w-0">
      <slot />
    </dd>
  </div>
</template>

<style scoped>
.setting-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  padding: 12px 16px;
}

.setting-row + .setting-row {
  border-top: 1px solid var(--xbo-hairline);
}

.setting-row dt {
  flex: 1 1 220px;
}

.setting-row dd {
  max-width: 100%;
}
</style>
