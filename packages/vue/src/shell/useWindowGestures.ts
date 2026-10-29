import { ref } from 'vue';
import { boundsForDropTarget, dropTargetAt, resizeBounds, type Bounds, type DropTarget, type ResizeEdge } from '@xbo-ui/core';
import { useXbo } from '../composables';
import { toRootPoint } from './rootGeometry';

const dragThreshold = 3;

export function useWindowGestures(windowId: string) {
  const xbo = useXbo();
  const isInteracting = ref(false);

  function limitsFor(appId: string) {
    const app = xbo.findApp(appId);

    return app ? { minSize: app.minSize, maxSize: app.maxSize } : undefined;
  }

  function startMove(event: PointerEvent): void {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button, input, [data-no-drag]')) return;

    const handle = event.currentTarget as HTMLElement;
    const desktopWindow = xbo.windows.find(windowId);

    if (!desktopWindow) return;

    xbo.windows.focus(windowId);

    const start = toRootPoint(xbo, event.clientX, event.clientY);
    const startBounds = { ...desktopWindow.bounds };
    const wasLaidOut = desktopWindow.mode === 'maximized' || desktopWindow.snap !== null;
    let grabX = start.x - startBounds.x;
    let grabY = start.y - startBounds.y;
    let hasMoved = false;
    let dropTarget: DropTarget | null = null;

    handle.setPointerCapture(event.pointerId);

    function onMove(moveEvent: PointerEvent): void {
      const current = xbo.windows.find(windowId);
      const point = toRootPoint(xbo, moveEvent.clientX, moveEvent.clientY);

      if (!current) return;
      if (!hasMoved && Math.hypot(point.x - start.x, point.y - start.y) < dragThreshold) return;

      if (!hasMoved) {
        hasMoved = true;
        isInteracting.value = true;

        if (wasLaidOut) {
          const restored = current.restoreBounds;
          const ratio = (start.x - startBounds.x) / startBounds.width;

          grabX = Math.round(restored.width * ratio);
          grabY = Math.min(grabY, 20);
          xbo.windows.setBounds(windowId, { ...restored, x: point.x - grabX, y: point.y - grabY });
        }
      }

      const workspace = xbo.windows.state.workspace;
      const y = Math.max(workspace.y, point.y - grabY);

      xbo.windows.setBounds(windowId, { ...current.bounds, x: point.x - grabX, y });
      dropTarget = dropTargetAt(point.x, point.y, workspace);
      xbo.windows.state.dropPreview = dropTarget ? boundsForDropTarget(dropTarget, workspace) : null;
    }

    function onEnd(): void {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onEnd);
      handle.removeEventListener('pointercancel', onEnd);
      xbo.windows.state.dropPreview = null;
      isInteracting.value = false;

      if (!hasMoved) return;
      if (dropTarget === 'maximize') xbo.windows.maximize(windowId);
      else if (dropTarget) xbo.windows.snap(windowId, dropTarget);
      else xbo.windows.commitBounds(windowId);
    }

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onEnd);
    handle.addEventListener('pointercancel', onEnd);
  }

  function startResize(event: PointerEvent, edge: ResizeEdge): void {
    if (event.button !== 0) return;

    const handle = event.currentTarget as HTMLElement;
    const desktopWindow = xbo.windows.find(windowId);

    if (!desktopWindow) return;

    event.stopPropagation();
    xbo.windows.focus(windowId);
    handle.setPointerCapture(event.pointerId);
    isInteracting.value = true;

    const startX = event.clientX;
    const startY = event.clientY;
    const start: Bounds = { ...desktopWindow.bounds };
    const limits = limitsFor(desktopWindow.appId);

    function onMove(moveEvent: PointerEvent): void {
      xbo.windows.setBounds(windowId, resizeBounds(start, edge, moveEvent.clientX - startX, moveEvent.clientY - startY, xbo.windows.state.workspace, limits));
    }

    function onEnd(): void {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onEnd);
      handle.removeEventListener('pointercancel', onEnd);
      isInteracting.value = false;
      xbo.windows.commitBounds(windowId);
    }

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onEnd);
    handle.addEventListener('pointercancel', onEnd);
  }

  return { isInteracting, startMove, startResize };
}
