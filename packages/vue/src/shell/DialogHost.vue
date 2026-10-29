<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { FocusScope } from 'reka-ui';
import { useXbo } from '../composables';
import { RiErrorWarningLine } from '../icons';

const props = withDefaults(
  defineProps<{
    windowId?: string | null;
  }>(),
  { windowId: null },
);

const xbo = useXbo();
const value = ref('');
const confirmButton = ref<HTMLButtonElement | null>(null);
const promptInput = ref<HTMLInputElement | null>(null);

const dialog = computed(() => xbo.dialogs.find((candidate) => candidate.windowId === props.windowId) ?? null);
const isSheet = computed(() => props.windowId !== null);
const titleId = computed(() => `${dialog.value?.id}-title`);
const messageId = computed(() => `${dialog.value?.id}-message`);

watch(
  () => dialog.value?.id,
  async (dialogId) => {
    if (!dialogId || !dialog.value) return;

    value.value = dialog.value.defaultValue;
    await nextTick();

    if (dialog.value.kind === 'prompt') promptInput.value?.select();
    else confirmButton.value?.focus();
  },
  { immediate: true },
);

function cancel(): void {
  if (!dialog.value) return;

  xbo.settleDialog(dialog.value.id, dialog.value.kind === 'confirm' ? false : null);
}

function confirm(): void {
  if (!dialog.value) return;

  xbo.settleDialog(dialog.value.id, dialog.value.kind === 'prompt' ? value.value : true);
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    cancel();
  }
}
</script>

<template>
  <Transition :name="isSheet ? 'sheet' : 'dialog'">
    <div
      v-if="dialog"
      class="dialog-scrim xb:absolute xb:inset-0 xb:flex xb:justify-center"
      :class="isSheet ? 'is-sheet' : 'xb:items-center'"
      :style="{ zIndex: isSheet ? 20 : 'var(--xbo-z-dialog)' }"
      @keydown="onKeydown"
    >
      <FocusScope trapped loop as-child>
        <form
          class="dialog-panel xb:flex xb:w-[min(420px,calc(100%-32px))] xb:flex-col xb:gap-4 xb:bg-window xb:p-5 xb:shadow-popover"
          :class="isSheet ? 'xb:rounded-b-lg' : 'xb:rounded-lg'"
          :role="dialog.kind === 'prompt' ? 'dialog' : 'alertdialog'"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="dialog.message ? messageId : undefined"
          @submit.prevent="confirm"
        >
          <div class="xb:flex xb:gap-3">
            <RiErrorWarningLine v-if="dialog.tone === 'danger'" width="22" height="22" class="xb:mt-0.5 xb:text-danger" aria-hidden="true" />
            <div class="xb:flex xb:min-w-0 xb:flex-col xb:gap-1">
              <h2 :id="titleId" class="xb:text-title xb:font-semibold xb:text-ink">{{ dialog.title }}</h2>
              <p v-if="dialog.message" :id="messageId" class="xb:text-body xb:text-ink-muted">{{ dialog.message }}</p>
            </div>
          </div>
          <input
            v-if="dialog.kind === 'prompt'"
            ref="promptInput"
            v-model="value"
            type="text"
            class="xb:h-8 xb:rounded-sm xb:bg-window xb:px-2.5 xb:text-body xb:text-ink xb:ring-1 xb:ring-field-border xb:outline-none xb:focus:ring-2 xb:focus:ring-primary"
            :placeholder="dialog.placeholder"
            :aria-label="dialog.title"
          />
          <div class="xb:flex xb:justify-end xb:gap-2">
            <button v-if="dialog.kind !== 'alert'" type="button" class="dialog-button" @click="cancel">{{ dialog.cancelLabel }}</button>
            <button ref="confirmButton" type="submit" class="dialog-button is-primary" :class="{ 'is-danger': dialog.tone === 'danger' }">
              {{ dialog.confirmLabel }}
            </button>
          </div>
        </form>
      </FocusScope>
    </div>
  </Transition>
</template>

<style scoped>
.dialog-scrim {
  background: rgb(var(--xbo-shade) / 0.24);
}

.dialog-scrim.is-sheet {
  align-items: flex-start;
  background: rgb(var(--xbo-shade) / 0.12);
}

.dialog-button {
  height: 28px;
  min-width: 76px;
  border-radius: var(--xbo-radius-sm);
  padding: 0 12px;
  background: var(--xbo-window);
  box-shadow: inset 0 0 0 1px var(--xbo-field-border);
  color: var(--xbo-ink);
  font-weight: 500;
}

.dialog-button:hover {
  background: var(--xbo-chrome);
}

.dialog-button.is-primary {
  background: var(--xbo-primary);
  box-shadow: none;
  color: var(--xbo-on-primary);
}

.dialog-button.is-primary:hover {
  background: var(--xbo-primary-hover);
}

.dialog-button.is-danger {
  background: var(--xbo-danger);
  color: oklch(1 0 0);
}

/* Dark mode lightens danger for text use, so its fill needs dark text to keep 4.5:1. */
:where([data-xbo-mode='dark']) .dialog-button.is-danger {
  color: oklch(0.2 0.03 25);
}

.dialog-enter-active,
.dialog-leave-active,
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 160ms var(--xbo-ease-out);
}

.dialog-enter-active .dialog-panel,
.dialog-leave-active .dialog-panel,
.sheet-enter-active .dialog-panel,
.sheet-leave-active .dialog-panel {
  transition: transform 200ms var(--xbo-ease-out);
}

.dialog-enter-from,
.dialog-leave-to,
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog-panel,
.dialog-leave-to .dialog-panel {
  transform: scale(0.97);
}

.sheet-enter-from .dialog-panel,
.sheet-leave-to .dialog-panel {
  transform: translateY(-100%);
}
</style>
