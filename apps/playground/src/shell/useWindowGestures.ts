import { ref } from 'vue';
import { useWindowsStore } from '../stores/windows';
import {
  boundsForDropTarget,
  dropTargetAt,
  minimumWindowSize,
  type Bounds,
  type DropTarget,
} from '../legacy';

export const resizeEdges = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const;

export type ResizeEdge = (typeof resizeEdges)[number];

const dragThreshold = 3;

export function useWindowGestures(windowId: string) {
  const store = useWindowsStore();
  const isInteracting = ref(false);

  function startMove(event: PointerEvent): void {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button, [data-no-drag]')) return;

    const handle = event.currentTarget as HTMLElement;
    const desktopWindow = store.find(windowId);

    if (!desktopWindow) return;

    store.focus(windowId);

    const startX = event.clientX;
    const startY = event.clientY;
    const startBounds = { ...desktopWindow.bounds };
    const wasLaidOut = desktopWindow.mode === 'maximized' || desktopWindow.snap !== null;
    let grabX = startX - startBounds.x;
    let grabY = startY - startBounds.y;
    let hasMoved = false;
    let dropTarget: DropTarget | null = null;

    handle.setPointerCapture(event.pointerId);

    function onMove(moveEvent: PointerEvent): void {
      const current = store.find(windowId);

      if (!current) return;
      if (!hasMoved && Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < dragThreshold) return;

      if (!hasMoved) {
        hasMoved = true;
        isInteracting.value = true;

        if (wasLaidOut) {
          const restored = current.restoreBounds;
          const ratio = (startX - startBounds.x) / startBounds.width;

          grabX = Math.round(restored.width * ratio);
          grabY = Math.min(grabY, 20);
          store.setBounds(windowId, { ...restored, x: moveEvent.clientX - grabX, y: moveEvent.clientY - grabY });
        }
      }

      const workspace = store.workspace;
      const y = Math.max(workspace.y, moveEvent.clientY - grabY);

      store.setBounds(windowId, { ...current.bounds, x: moveEvent.clientX - grabX, y });
      dropTarget = dropTargetAt(moveEvent.clientX, moveEvent.clientY, workspace);
      store.dropPreview = dropTarget ? boundsForDropTarget(dropTarget, workspace) : null;
    }

    function onEnd(): void {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onEnd);
      handle.removeEventListener('pointercancel', onEnd);
      store.dropPreview = null;
      isInteracting.value = false;

      if (!hasMoved) return;
      if (dropTarget === 'maximize') store.maximize(windowId);
      else if (dropTarget) store.snap(windowId, dropTarget);
      else store.commitBounds(windowId);
    }

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onEnd);
    handle.addEventListener('pointercancel', onEnd);
  }

  function startResize(event: PointerEvent, edge: ResizeEdge): void {
    if (event.button !== 0) return;

    const handle = event.currentTarget as HTMLElement;
    const desktopWindow = store.find(windowId);

    if (!desktopWindow) return;

    event.stopPropagation();
    store.focus(windowId);
    handle.setPointerCapture(event.pointerId);
    isInteracting.value = true;

    const startX = event.clientX;
    const startY = event.clientY;
    const start: Bounds = { ...desktopWindow.bounds };

    function onMove(moveEvent: PointerEvent): void {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const next: Bounds = { ...start };

      if (edge.includes('e')) next.width = Math.max(minimumWindowSize.width, start.width + dx);
      if (edge.includes('s')) next.height = Math.max(minimumWindowSize.height, start.height + dy);
      if (edge.includes('w')) {
        next.width = Math.max(minimumWindowSize.width, start.width - dx);
        next.x = start.x + start.width - next.width;
      }
      if (edge.includes('n')) {
        next.height = Math.max(minimumWindowSize.height, start.height - dy);
        next.y = Math.max(store.workspace.y, start.y + start.height - next.height);
        next.height = start.y + start.height - next.y;
      }

      store.setBounds(windowId, next);
    }

    function onEnd(): void {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onEnd);
      handle.removeEventListener('pointercancel', onEnd);
      isInteracting.value = false;
      store.commitBounds(windowId);
    }

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onEnd);
    handle.addEventListener('pointercancel', onEnd);
  }

  return { isInteracting, startMove, startResize };
}
