import type { XboInstance } from '../instance';

export interface RootRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Window bounds, drop previews and teleported popovers are all positioned relative to the desktop root, which is
// not the viewport when the desktop is embedded in a page.
export function rootRect(xbo: XboInstance): RootRect {
  const rect = xbo.ui.rootElement?.getBoundingClientRect();

  return rect
    ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
    : { top: 0, left: 0, width: globalThis.innerWidth ?? 0, height: globalThis.innerHeight ?? 0 };
}

export function toRootPoint(xbo: XboInstance, clientX: number, clientY: number): { x: number; y: number } {
  const rect = rootRect(xbo);

  return { x: clientX - rect.left, y: clientY - rect.top };
}
