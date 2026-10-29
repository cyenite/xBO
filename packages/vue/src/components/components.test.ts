import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref, type Component } from 'vue';
import { mount } from '@vue/test-utils';
import { memoryStorageAdapter } from '@xbo-ui/core';
import { defineApp } from '../config';
import { createXbo } from '../instance';
import { addDecimal, compareDecimal, normalizeDecimal } from './decimal';
import XboDataGrid, { type GridColumn } from './XboDataGrid.vue';
import XboFormField from './XboFormField.vue';
import XboNumberField from './XboNumberField.vue';
import XboTextField from './XboTextField.vue';

function plugin() {
  return createXbo({
    apps: [defineApp({ id: 'blank', label: 'Blank', component: defineComponent({ render: () => h('div') }) })],
    preferences: { storage: memoryStorageAdapter() },
    startup: { isSessionRestored: false },
  });
}

interface Person {
  id: string;
  name: string;
  city: string;
}

const people: Person[] = [
  { id: 'a', name: 'Ada', city: 'Nairobi' },
  { id: 'b', name: 'Ben', city: 'Kampala' },
  { id: 'c', name: 'Cleo', city: 'Arusha' },
];

// Mounting a generic component loses its row type, so the grid is mounted as a plain component.
const Grid = XboDataGrid as unknown as Component;

const columns: GridColumn<Person>[] = [
  { key: 'name', label: 'Name', isEditable: true },
  { key: 'city', label: 'City' },
];

describe('decimal maths', () => {
  it('rounds half away from zero without floating point drift', () => {
    expect(normalizeDecimal('0.125', 2)).toBe('0.13');
    expect(normalizeDecimal('-0.125', 2)).toBe('-0.13');
    expect(normalizeDecimal('1.005', 2)).toBe('1.01');
    expect(normalizeDecimal('12', 2)).toBe('12.00');
    expect(normalizeDecimal('', 2)).toBe('');
  });

  it('adds and compares exactly', () => {
    expect(addDecimal('0.1', '0.2', 2)).toBe('0.30');
    expect(addDecimal('0.05', '-0.10', 2)).toBe('-0.05');
    expect(compareDecimal('10.00', '9.99', 2)).toBe(1);
    expect(compareDecimal('-1', '1', 0)).toBe(-1);
  });
});

describe('form controls', () => {
  it('links the label, hint and error of a form field to its input', async () => {
    const wrapper = mount(
      defineComponent({
        components: { XboFormField, XboTextField },
        setup: () => ({ value: ref('') }),
        template: '<XboFormField label="Email" hint="Work address" error="Required"><XboTextField v-model="value" /></XboFormField>',
      }),
    );
    const input = wrapper.find('input');
    const label = wrapper.find('label');

    expect(label.attributes('for')).toBe(input.attributes('id'));
    expect(input.attributes('aria-invalid')).toBe('true');
    expect(wrapper.find(`[id="${input.attributes('aria-describedby')}"]`).text()).toContain('Required');
  });

  it('keeps number input as an exact, clamped decimal string', async () => {
    const value = ref('');
    const wrapper = mount(XboNumberField, { props: { 'modelValue': value.value, 'onUpdate:modelValue': (next: string) => (value.value = next), 'max': '100', 'scale': 2 } });
    const input = wrapper.find('input');

    await input.setValue('12.345');
    await input.trigger('blur');
    expect(value.value).toBe('12.35');

    await input.setValue('250');
    await input.trigger('blur');
    expect(value.value).toBe('100.00');

    await input.trigger('keydown', { key: 'ArrowDown' });
    expect(value.value).toBe('99.00');
  });

  it('refuses characters that cannot form a decimal', async () => {
    const wrapper = mount(XboNumberField, { props: { modelValue: '1' } });
    const input = wrapper.find('input');

    input.element.value = '1a';
    await input.trigger('input');

    expect(input.element.value).toBe('1');
  });
});

describe('XboDataGrid', () => {
  function mountGrid(props: Record<string, unknown> = {}) {
    return mount(Grid, { props: { rows: people, label: 'People', rowKey: 'id', columns, ...props }, global: { plugins: [plugin()] } });
  }

  it('extends a multiple selection with Shift and arrow keys', async () => {
    const wrapper = mountGrid({ selectionMode: 'multiple', selection: [] });
    const grid = wrapper.find('[role="grid"]');

    await wrapper.findAll('[role="row"][data-row-key]')[0]!.trigger('click');
    await grid.trigger('keydown', { key: 'ArrowDown', shiftKey: true });
    await grid.trigger('keydown', { key: 'ArrowDown', shiftKey: true });

    expect(wrapper.emitted('update:selection')?.at(-1)).toEqual([['a', 'b', 'c']]);
  });

  it('copies the selected rows as tab-separated text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(globalThis.navigator, 'clipboard', { value: { writeText }, configurable: true });

    const wrapper = mountGrid({ selected: 'b' });

    await wrapper.findAll('[role="row"][data-row-key]')[1]!.trigger('click');
    await wrapper.find('[role="grid"]').trigger('keydown', { key: 'c', ctrlKey: true, metaKey: true });

    expect(writeText).toHaveBeenCalledWith('Name\tCity\nBen\tKampala');
  });

  it('edits an editable cell and reports the new value', async () => {
    const wrapper = mountGrid();

    await wrapper.findAll('[role="row"][data-row-key]')[0]!.trigger('click');
    await wrapper.find('[role="grid"]').trigger('keydown', { key: 'F2' });
    await nextTick();

    const editor = wrapper.find('input.cell-editor');

    await editor.setValue('Ada Lovelace');
    await editor.trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('edit')?.[0]?.[0]).toMatchObject({ key: 'name', value: 'Ada Lovelace', row: { id: 'a' } });
  });

  it('hides columns listed in hiddenColumns', () => {
    const wrapper = mountGrid({ hiddenColumns: ['city'] });

    expect(wrapper.findAll('[role="columnheader"]').map((header) => header.text())).toEqual(['Name']);
  });

  it('renders only a window of rows when virtualised', () => {
    const many = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), name: `Person ${index}`, city: 'Nairobi' }));
    const wrapper = mountGrid({ rows: many });

    expect(wrapper.findAll('[role="row"][data-row-key]').length).toBeLessThan(100);
    expect(wrapper.find('[role="grid"]').attributes('aria-rowcount')).toBe('1001');
  });
});
