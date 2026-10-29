export interface Searchable {
  label: string;
  keywords?: readonly string[];
}

// Higher is better: a prefix match on the label beats a word match, which beats a substring, which beats a keyword.
export function scoreSearchable(item: Searchable, query: string): number {
  const needle = query.trim().toLowerCase();

  if (needle === '') return 1;

  const label = item.label.toLowerCase();

  if (label.startsWith(needle)) return 4;
  if (label.split(/\s+/).some((word) => word.startsWith(needle))) return 3;
  if (label.includes(needle)) return 2;
  if (item.keywords?.some((keyword) => keyword.toLowerCase().includes(needle))) return 1;

  return 0;
}

// Keeps the original order among items with the same score, so callers control the order of ties.
export function rankSearchables<T extends Searchable>(items: readonly T[], query: string): T[] {
  return items
    .map((item, order) => ({ item, order, score: scoreSearchable(item, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((entry) => entry.item);
}
