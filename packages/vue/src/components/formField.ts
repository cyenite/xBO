import { computed, inject, useId, type ComputedRef, type InjectionKey } from 'vue';

export interface FormFieldContext {
  inputId: string;
  isInvalid: ComputedRef<boolean>;
  isRequired: ComputedRef<boolean>;
  describedBy: ComputedRef<string | undefined>;
}

export const formFieldKey: InjectionKey<FormFieldContext> = Symbol('xbo-form-field');

// Inputs inside XboFormField take its id and descriptions so the label, hint and error are announced with them.
export function useFormFieldControl(id?: string) {
  const field = inject(formFieldKey, null);
  const fallbackId = useId();

  return {
    inputId: computed(() => id ?? field?.inputId ?? fallbackId),
    isInvalid: computed(() => field?.isInvalid.value ?? false),
    isRequired: computed(() => field?.isRequired.value ?? false),
    describedBy: computed(() => field?.describedBy.value),
  };
}
