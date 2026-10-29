export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const snapZones = ['left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

export type SnapZone = (typeof snapZones)[number];
export type DropTarget = SnapZone | 'maximize';

export interface Size {
  width: number;
  height: number;
}

export interface SizeLimits {
  minSize: Size;
  maxSize: Size | null;
}

export const resizeEdges = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const;

export type ResizeEdge = (typeof resizeEdges)[number];

export const minimumWindowSize: Size = { width: 380, height: 260 };

export const defaultSizeLimits: SizeLimits = { minSize: minimumWindowSize, maxSize: null };

const snapGap = 6;
const edgeThreshold = 6;
const cornerThreshold = 96;
const cascadeStep = 28;

export function boundsForSnap(zone: SnapZone, workspace: Bounds): Bounds {
  const halfWidth = Math.round((workspace.width - snapGap * 3) / 2);
  const halfHeight = Math.round((workspace.height - snapGap * 3) / 2);
  const fullHeight = workspace.height - snapGap * 2;
  const left = workspace.x + snapGap;
  const top = workspace.y + snapGap;
  const right = workspace.x + snapGap * 2 + halfWidth;
  const bottom = workspace.y + snapGap * 2 + halfHeight;

  switch (zone) {
    case 'left':
      return { x: left, y: top, width: halfWidth, height: fullHeight };
    case 'right':
      return { x: right, y: top, width: halfWidth, height: fullHeight };
    case 'top-left':
      return { x: left, y: top, width: halfWidth, height: halfHeight };
    case 'top-right':
      return { x: right, y: top, width: halfWidth, height: halfHeight };
    case 'bottom-left':
      return { x: left, y: bottom, width: halfWidth, height: halfHeight };
    case 'bottom-right':
      return { x: right, y: bottom, width: halfWidth, height: halfHeight };
  }
}

export function maximizedBounds(workspace: Bounds): Bounds {
  return { ...workspace };
}

export function dropTargetAt(pointerX: number, pointerY: number, workspace: Bounds): DropTarget | null {
  const isNearLeft = pointerX <= workspace.x + edgeThreshold;
  const isNearRight = pointerX >= workspace.x + workspace.width - edgeThreshold;
  const isNearTop = pointerY <= workspace.y + edgeThreshold;
  const isInTopCorner = pointerY <= workspace.y + cornerThreshold;
  const isInBottomCorner = pointerY >= workspace.y + workspace.height - cornerThreshold;

  if (isNearLeft) return isInTopCorner ? 'top-left' : isInBottomCorner ? 'bottom-left' : 'left';
  if (isNearRight) return isInTopCorner ? 'top-right' : isInBottomCorner ? 'bottom-right' : 'right';
  if (isNearTop) return 'maximize';

  return null;
}

export function boundsForDropTarget(target: DropTarget, workspace: Bounds): Bounds {
  return target === 'maximize' ? maximizedBounds(workspace) : boundsForSnap(target, workspace);
}

export function cascadeBounds(index: number, size: Size, workspace: Bounds, limits: SizeLimits = defaultSizeLimits): Bounds {
  const width = Math.min(size.width, workspace.width - snapGap * 2);
  const height = Math.min(size.height, workspace.height - snapGap * 2);
  const centeredX = workspace.x + Math.round((workspace.width - width) / 2);
  const centeredY = workspace.y + Math.max(snapGap, Math.round((workspace.height - height) / 3));
  const offset = (index % 8) * cascadeStep;
  const maxX = workspace.x + workspace.width - width - snapGap;
  const maxY = workspace.y + workspace.height - height - snapGap;
  const x = Math.min(Math.max(workspace.x + snapGap, centeredX - 3.5 * cascadeStep + offset), Math.max(workspace.x + snapGap, maxX));
  const y = Math.min(Math.max(workspace.y + snapGap, centeredY - cascadeStep * 2 + offset), Math.max(workspace.y + snapGap, maxY));

  return clampBounds({ x, y, width, height }, workspace, limits);
}

// Windows may extend past the workspace, but the title bar must stay reachable.
export function clampBounds(bounds: Bounds, workspace: Bounds, limits: SizeLimits = defaultSizeLimits): Bounds {
  const maxWidth = Math.min(limits.maxSize?.width ?? Infinity, workspace.width);
  const maxHeight = Math.min(limits.maxSize?.height ?? Infinity, workspace.height);
  const width = Math.max(limits.minSize.width, Math.min(bounds.width, maxWidth));
  const height = Math.max(limits.minSize.height, Math.min(bounds.height, maxHeight));
  const reachable = 120;
  const x = Math.min(Math.max(bounds.x, workspace.x - width + reachable), workspace.x + workspace.width - reachable);
  const y = Math.min(Math.max(bounds.y, workspace.y), workspace.y + workspace.height - 40);

  return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
}

// Resizing from a west or north edge keeps the opposite edge fixed, and the top edge never rises above the workspace.
export function resizeBounds(start: Bounds, edge: ResizeEdge, dx: number, dy: number, workspace: Bounds, limits: SizeLimits = defaultSizeLimits): Bounds {
  const maxWidth = limits.maxSize?.width ?? Infinity;
  const maxHeight = limits.maxSize?.height ?? Infinity;
  const next: Bounds = { ...start };
  const limitWidth = (width: number) => Math.min(maxWidth, Math.max(limits.minSize.width, width));
  const limitHeight = (height: number) => Math.min(maxHeight, Math.max(limits.minSize.height, height));

  if (edge.includes('e')) next.width = limitWidth(start.width + dx);
  if (edge.includes('s')) next.height = limitHeight(start.height + dy);

  if (edge.includes('w')) {
    next.width = limitWidth(start.width - dx);
    next.x = start.x + start.width - next.width;
  }

  if (edge.includes('n')) {
    next.height = limitHeight(start.height - dy);
    next.y = Math.max(workspace.y, start.y + start.height - next.height);
    next.height = start.y + start.height - next.y;
  }

  return next;
}
