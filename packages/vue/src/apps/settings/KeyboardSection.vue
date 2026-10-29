<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue';
import { bindingFromEvent, findBindingConflicts, formatBinding, isBrowserReserved } from '@xbo-ui/core';
import { useXbo } from '../../composables';
import type { MessageKey } from '../../i18n';
import { RiRestartLine } from '../../icons';
import SettingGroup from './SettingGroup.vue';
import SettingRow from './SettingRow.vue';

const xbo = useXbo();

const isLocked = computed(() => xbo.lockedKeys.has('shortcutOverrides'));
const definitions = computed(() => [...xbo.shortcutDefinitions.values()]);
const conflicts = computed(() => findBindingConflicts(Object.fromEntries(definitions.value.map((definition) => [definition.id, xbo.bindingFor(definition.id)])), xbo.os));

// Built-in labels are message keys; developer shortcuts carry their own text.
function labelFor(shortcutId: string): string {
  const label = xbo.shortcutDefinitions.get(shortcutId)?.label ?? shortcutId;

  return label.startsWith('shortcut.') ? xbo.t(label as MessageKey) : label;
}

function warningFor(shortcutId: string): string {
  const binding = xbo.bindingFor(shortcutId);

  if (binding === '') return '';
  if (isBrowserReserved(binding, xbo.os)) return xbo.t('settings.shortcuts.reserved', { binding: formatBinding(binding, xbo.os) });

  for (const ids of conflicts.value.values()) {
    const other = ids.find((candidate) => candidate !== shortcutId);

    if (ids.includes(shortcutId) && other) return xbo.t('settings.shortcuts.conflict', { label: labelFor(other) });
  }

  return '';
}

function record(shortcutId: string): void {
  xbo.ui.recordingShortcutId = shortcutId;
}

function stopRecording(): void {
  xbo.ui.recordingShortcutId = null;
}

function onKeydown(event: KeyboardEvent, shortcutId: string): void {
  if (xbo.ui.recordingShortcutId !== shortcutId) return;

  event.preventDefault();
  event.stopPropagation();

  if (event.key === 'Escape' && !event.ctrlKey && !event.altKey && !event.metaKey) {
    stopRecording();

    return;
  }

  const binding = bindingFromEvent(event);

  if (!binding) return;

  xbo.setPreference('shortcutOverrides', { ...xbo.preferences.shortcutOverrides, [shortcutId]: binding });
  stopRecording();
}

function reset(shortcutId: string): void {
  xbo.setPreference('shortcutOverrides', Object.fromEntries(Object.entries(xbo.preferences.shortcutOverrides).filter(([id]) => id !== shortcutId)));
}

onBeforeUnmount(stopRecording);
</script>

<template>
  <div class="xb:flex xb:flex-col xb:gap-3">
    <p class="xb:text-body xb:text-ink-muted">{{ xbo.t('settings.shortcuts.hint') }}</p>
    <SettingGroup :title="xbo.t('settings.keyboard')">
      <SettingRow v-for="definition in definitions" :key="definition.id" :label="labelFor(definition.id)" :hint="warningFor(definition.id)" :is-locked="isLocked">
        <div class="xb:flex xb:items-center xb:gap-1.5">
          <button
            type="button"
            class="binding xbo-figures"
            :class="{ 'is-recording': xbo.ui.recordingShortcutId === definition.id }"
            :disabled="isLocked"
            :aria-label="`${xbo.t('settings.shortcuts.change')}: ${labelFor(definition.id)}`"
            @click="record(definition.id)"
            @keydown="onKeydown($event, definition.id)"
            @blur="stopRecording"
          >
            <template v-if="xbo.ui.recordingShortcutId === definition.id">{{ xbo.t('settings.shortcuts.recording') }}</template>
            <kbd v-else class="xb:font-sans">{{ xbo.shortcutLabel(definition.id) || xbo.t('settings.shortcuts.none') }}</kbd>
          </button>
          <button
            v-if="definition.id in xbo.preferences.shortcutOverrides"
            type="button"
            class="reset"
            :disabled="isLocked"
            :aria-label="`${xbo.t('settings.shortcuts.reset')}: ${labelFor(definition.id)}`"
            :title="xbo.t('settings.shortcuts.reset')"
            @click="reset(definition.id)"
          >
            <RiRestartLine width="14" height="14" aria-hidden="true" />
          </button>
        </div>
      </SettingRow>
    </SettingGroup>
    <div>
      <button
        type="button"
        class="xb:rounded-sm xb:bg-chrome xb:px-3 xb:py-1 xb:text-body xb:font-medium xb:text-ink xb:ring-1 xb:ring-field-border xb:hover:bg-hover"
        :disabled="isLocked || Object.keys(xbo.preferences.shortcutOverrides).length === 0"
        @click="xbo.setPreference('shortcutOverrides', {})"
      >
        {{ xbo.t('settings.shortcuts.resetAll') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.binding {
  min-width: 112px;
  height: 26px;
  border-radius: var(--xbo-radius-sm);
  padding: 0 10px;
  background: var(--xbo-chrome);
  box-shadow: inset 0 0 0 1px var(--xbo-field-border);
  color: var(--xbo-ink);
  font-size: calc(12px * var(--xbo-text-scale));
}

.binding:hover {
  background: var(--xbo-hover);
}

.binding.is-recording {
  background: var(--xbo-primary-soft);
  box-shadow: inset 0 0 0 2px var(--xbo-primary);
  color: var(--xbo-primary);
}

.reset {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border-radius: var(--xbo-radius-sm);
  color: var(--xbo-ink-muted);
}

.reset:hover {
  background: var(--xbo-hover);
  color: var(--xbo-ink);
}
</style>
