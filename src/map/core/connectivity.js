import { idx, inBounds } from "./MapModel.js";
import { TILE, WALKABLE } from "./tiles.js";

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export function floodFill(m, sx, sy) {
  const seen = new Uint8Array(m.w * m.h);
  if (!inBounds(m, sx, sy) || !WALKABLE.has(m.tiles[idx(m, sx, sy)])) return seen;
  const stack = [[sx, sy]];
  seen[idx(m, sx, sy)] = 1;
  while (stack.length) {
    const [x, y] = stack.pop();
    for (const [dx, dy] of DIRS) {
      const nx = x + dx;
      const ny = y + dy;
      if (
        inBounds(m, nx, ny) &&
        !seen[idx(m, nx, ny)] &&
        WALKABLE.has(m.tiles[idx(m, nx, ny)])
      ) {
        seen[idx(m, nx, ny)] = 1;
        stack.push([nx, ny]);
      }
    }
  }
  return seen;
}

export function countWalkable(m) {
  let c = 0;
  for (let i = 0; i < m.tiles.length; i++) if (WALKABLE.has(m.tiles[i])) c++;
  return c;
}

export function firstWalkable(m) {
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      if (WALKABLE.has(m.tiles[idx(m, x, y)])) return [x, y];
    }
  }
  return null;
}

export function isFullyConnected(m) {
  const start = firstWalkable(m);
  if (!start) return false;
  const mask = floodFill(m, start[0], start[1]);
  let reached = 0;
  for (let i = 0; i < mask.length; i++) reached += mask[i];
  return reached === countWalkable(m);
}

export function keepLargestRegion(m) {
  const visited = new Uint8Array(m.w * m.h);
  let best = null;
  let bestSize = 0;
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      const i = idx(m, x, y);
      if (visited[i] || !WALKABLE.has(m.tiles[i])) continue;
      const region = floodFill(m, x, y);
      let size = 0;
      for (let k = 0; k < region.length; k++) {
        if (region[k]) {
          visited[k] = 1;
          size++;
        }
      }
      if (size > bestSize) {
        bestSize = size;
        best = region;
      }
    }
  }
  if (!best) return m;
  for (let i = 0; i < m.tiles.length; i++) {
    if (WALKABLE.has(m.tiles[i]) && !best[i]) m.tiles[i] = TILE.WALL;
  }
  return m;
}
