import { TILE } from "./tiles.js";

export function createMapModel(w, h, fill = TILE.WALL) {
  const tiles = new Uint8Array(w * h);
  if (fill !== 0) tiles.fill(fill);
  return { w, h, tiles, rooms: [], meta: {}, seed: 0, params: null };
}

export const idx = (m, x, y) => y * m.w + x;

export const inBounds = (m, x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h;

export function getTile(m, x, y) {
  return inBounds(m, x, y) ? m.tiles[idx(m, x, y)] : TILE.WALL;
}

export function setTile(m, x, y, t) {
  if (inBounds(m, x, y)) m.tiles[idx(m, x, y)] = t;
}
