import { describe, expect, it } from 'vitest';
import { boundsForSnap, cascadeBounds, clampBounds, dropTargetAt, minimumWindowSize } from './geometry';

const workspace = { x: 0, y: 30, width: 1200, height: 700 };

describe('window geometry', () => {
  it('splits the workspace into equal halves with gaps', () => {
    const left = boundsForSnap('left', workspace);
    const right = boundsForSnap('right', workspace);

    expect(left.width).toBe(right.width);
    expect(left.y).toBe(right.y);
    expect(right.x).toBeGreaterThan(left.x + left.width);
    expect(right.x + right.width).toBeLessThanOrEqual(workspace.x + workspace.width);
  });

  it('places quarters in the matching corners', () => {
    const topLeft = boundsForSnap('top-left', workspace);
    const bottomRight = boundsForSnap('bottom-right', workspace);

    expect(bottomRight.x).toBeGreaterThan(topLeft.x);
    expect(bottomRight.y).toBeGreaterThan(topLeft.y);
    expect(bottomRight.y + bottomRight.height).toBeLessThanOrEqual(workspace.y + workspace.height);
  });

  it('finds the drop target from the pointer position', () => {
    expect(dropTargetAt(2, 400, workspace)).toBe('left');
    expect(dropTargetAt(1198, 400, workspace)).toBe('right');
    expect(dropTargetAt(2, 50, workspace)).toBe('top-left');
    expect(dropTargetAt(1198, 720, workspace)).toBe('bottom-right');
    expect(dropTargetAt(600, 31, workspace)).toBe('maximize');
    expect(dropTargetAt(600, 400, workspace)).toBeNull();
  });

  it('opens cascaded windows fully inside the workspace', () => {
    for (let index = 0; index < 10; index += 1) {
      const bounds = cascadeBounds(index, { width: 900, height: 560 }, workspace);

      expect(bounds.x).toBeGreaterThanOrEqual(workspace.x);
      expect(bounds.y).toBeGreaterThanOrEqual(workspace.y);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(workspace.x + workspace.width);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(workspace.y + workspace.height);
    }
  });

  it('keeps windows reachable and above the minimum size', () => {
    const clamped = clampBounds({ x: -5000, y: -40, width: 100, height: 50 }, workspace);

    expect(clamped.width).toBe(minimumWindowSize.width);
    expect(clamped.height).toBe(minimumWindowSize.height);
    expect(clamped.y).toBe(workspace.y);
    expect(clamped.x + clamped.width).toBeGreaterThan(workspace.x);
  });
});
