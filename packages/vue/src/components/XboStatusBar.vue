<template>
  <footer class="status-bar">
    <div class="xb:flex xb:min-w-0 xb:items-center xb:gap-3"><slot /></div>
    <div class="xb:ml-auto xb:flex xb:shrink-0 xb:items-center xb:gap-3"><slot name="trailing" /></div>
  </footer>
</template>

<style scoped>
.status-bar {
  display: flex;
  height: 26px;
  flex-shrink: 0;
  align-items: center;
  gap: 12px;
  border-top: 1px solid var(--xbo-hairline);
  padding: 0 10px;
  background: var(--xbo-chrome);
  color: var(--xbo-ink-muted);
  font-size: calc(12px * var(--xbo-text-scale));
  font-variant-numeric: tabular-nums;
}
</style>
