<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { RiCornerDownLeftLine, RiSearchLine } from '../icons';
import { commandSections, scoreCommand, useShellCommands, type ShellCommand } from './commands';

const isOpen = defineModel<boolean>('open', { required: true });

const commands = useShellCommands();

const query = ref('');
const activeIndex = ref(0);
const inputElement = ref<HTMLInputElement | null>(null);

const results = computed<ShellCommand[]>(() =>
  commands.value
    .map((command, order) => ({ command, order, score: scoreCommand(command, query.value) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((entry) => entry.command),
);

const sections = computed(() =>
  commandSections
    .map((section) => ({ ...section, items: results.value.filter((command) => command.section === section.id) }))
    .filter((section) => section.items.length > 0),
);

const orderedResults = computed(() => sections.value.flatMap((section) => section.items));

watch(isOpen, async (isNowOpen) => {
  if (!isNowOpen) return;

  query.value = '';
  activeIndex.value = 0;
  await nextTick();
  inputElement.value?.focus();
});

watch(query, () => (activeIndex.value = 0));

function run(command: ShellCommand | undefined): void {
  if (!command) return;

  isOpen.value = false;
  command.run();
}

function onKeydown(event: KeyboardEvent): void {
  const count = orderedResults.value.length;

  if (event.key === 'Escape') {
    event.preventDefault();
    isOpen.value = false;
  } else if (event.key === 'ArrowDown' && count > 0) {
    event.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % count;
  } else if (event.key === 'ArrowUp' && count > 0) {
    event.preventDefault();
    activeIndex.value = (activeIndex.value - 1 + count) % count;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    run(orderedResults.value[activeIndex.value]);
  }
}

function indexOf(command: ShellCommand): number {
  return orderedResults.value.indexOf(command);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="palette">
      <div
        v-if="isOpen"
        class="fixed inset-0 flex justify-center pt-[14vh]"
        :style="{ zIndex: 'var(--z-palette)' }"
        @pointerdown.self="isOpen = false"
      >
        <div
          class="palette-panel material flex max-h-[min(520px,70vh)] w-[min(640px,calc(100vw-32px))] flex-col overflow-hidden rounded-xl shadow-popover"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <div class="flex items-center gap-3 border-b border-hairline px-4">
            <RiSearchLine width="18" height="18" class="shrink-0 text-ink-muted" aria-hidden="true" />
            <input
              ref="inputElement"
              v-model="query"
              type="text"
              class="h-12 min-w-0 flex-1 bg-transparent text-title text-ink outline-none placeholder:text-ink-subtle"
              placeholder="Open an app or run a command"
              role="combobox"
              aria-expanded="true"
              aria-controls="command-results"
              :aria-activedescendant="orderedResults[activeIndex] ? `command-${orderedResults[activeIndex]?.id}` : undefined"
              @keydown="onKeydown"
            />
          </div>

          <div id="command-results" class="min-h-0 flex-1 overflow-y-auto p-2" role="listbox" aria-label="Results">
            <template v-for="section in sections" :key="section.id">
              <p class="px-2 pt-2 pb-1 text-label text-ink-muted">{{ section.label }}</p>
              <div
                v-for="command in section.items"
                :id="`command-${command.id}`"
                :key="command.id"
                role="option"
                :aria-selected="indexOf(command) === activeIndex"
                class="flex h-9 cursor-default items-center gap-3 rounded-sm px-2"
                :class="indexOf(command) === activeIndex ? 'bg-primary-soft' : ''"
                @pointermove="activeIndex = indexOf(command)"
                @click="run(command)"
              >
                <component :is="command.icon" v-if="command.icon" width="16" height="16" class="shrink-0 text-ink-muted" aria-hidden="true" />
                <span class="truncate text-body text-ink">{{ command.label }}</span>
                <span v-if="command.detail" class="hidden truncate text-caption text-ink-subtle sm:inline">{{ command.detail }}</span>
                <span class="ml-auto shrink-0 text-caption text-ink-subtle">
                  <kbd v-if="command.shortcut" class="font-sans">{{ command.shortcut }}</kbd>
                  <RiCornerDownLeftLine v-else-if="indexOf(command) === activeIndex" width="14" height="14" aria-label="Press Enter" />
                </span>
              </div>
            </template>

            <p v-if="orderedResults.length === 0" class="px-3 py-8 text-center text-body text-ink-muted">
              No app or command matches “{{ query }}”. Try a module name such as “stock” or “credit”.
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.palette-enter-active,
.palette-leave-active {
  transition: opacity 160ms var(--ease-out-quint);
}

.palette-enter-active .palette-panel,
.palette-leave-active .palette-panel {
  transition: transform 180ms var(--ease-out-quint);
}

.palette-enter-from,
.palette-leave-to {
  opacity: 0;
}

.palette-enter-from .palette-panel,
.palette-leave-to .palette-panel {
  transform: translateY(-6px) scale(0.985);
}
</style>
