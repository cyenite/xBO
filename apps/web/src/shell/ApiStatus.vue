<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { healthResponseSchema } from '@xbo/contracts';
import { RiCheckboxCircleLine, RiCloudOffLine, RiLoopRightLine } from '../icons';
import { apiUrl } from '../api';

type ConnectionState = 'checking' | 'connected' | 'unreachable';

const state = ref<ConnectionState>('checking');
const version = ref<string | null>(null);

let pollTimer: ReturnType<typeof setInterval> | undefined;

async function check(): Promise<void> {
  try {
    const response = await fetch(apiUrl('/health'), { headers: { Accept: 'application/json' } });
    const health = healthResponseSchema.parse(await response.json());

    version.value = health.version;
    state.value = response.ok && health.status === 'ok' ? 'connected' : 'unreachable';
  } catch {
    state.value = 'unreachable';
  }
}

onMounted(() => {
  void check();
  pollTimer = setInterval(() => void check(), 30_000);
});

onBeforeUnmount(() => clearInterval(pollTimer));
</script>

<template>
  <button
    type="button"
    class="flex h-6 items-center gap-1.5 rounded-xs px-2 text-caption hover:bg-hover"
    :title="state === 'connected' ? `Connected to the xBO server ${version ?? ''}` : 'The xBO server is not responding. Click to check again.'"
    @click="check"
  >
    <RiLoopRightLine v-if="state === 'checking'" width="14" height="14" class="animate-spin text-ink-muted" aria-hidden="true" />
    <RiCheckboxCircleLine v-else-if="state === 'connected'" width="14" height="14" class="text-success" aria-hidden="true" />
    <RiCloudOffLine v-else width="14" height="14" class="text-danger" aria-hidden="true" />
    <span :class="state === 'unreachable' ? 'text-danger' : 'text-ink'">
      {{ state === 'checking' ? 'Connecting' : state === 'connected' ? 'Online' : 'Server offline' }}
    </span>
  </button>
</template>
