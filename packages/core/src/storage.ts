// Adapters may be synchronous (localStorage) or asynchronous (a desktop store, a server); callers handle both.
export interface StorageAdapter {
  load(key: string): unknown | Promise<unknown>;
  save(key: string, value: unknown): void | Promise<void>;
  remove(key: string): void | Promise<void>;
}

// Storage can be missing or throw (private windows, blocked site data), so every access is guarded:
// preferences and window positions are conveniences and losing them must never break the app.
export function localStorageAdapter(namespace = 'xbo'): StorageAdapter {
  const prefixed = (key: string) => `${namespace}.${key}`;

  return {
    load(key) {
      try {
        const raw = globalThis.localStorage?.getItem(prefixed(key));

        return raw === null || raw === undefined ? undefined : JSON.parse(raw);
      } catch {
        return undefined;
      }
    },
    save(key, value) {
      try {
        globalThis.localStorage?.setItem(prefixed(key), JSON.stringify(value));
      } catch {
        // See the note above the adapter.
      }
    },
    remove(key) {
      try {
        globalThis.localStorage?.removeItem(prefixed(key));
      } catch {
        // See the note above the adapter.
      }
    },
  };
}

export function memoryStorageAdapter(initial: Record<string, unknown> = {}): StorageAdapter {
  const entries = new Map(Object.entries(initial).map(([key, value]) => [key, structuredClone(value)]));

  return {
    load: (key) => structuredClone(entries.get(key)),
    save: (key, value) => void entries.set(key, structuredClone(value)),
    remove: (key) => void entries.delete(key),
  };
}

export function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return typeof (value as Promise<T> | undefined)?.then === 'function';
}
