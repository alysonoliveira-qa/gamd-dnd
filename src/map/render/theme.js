import { TILE } from "../core/tiles.js";

// Paleta alinhada aos design tokens (dark parchment / arcane / gold).
export const TILE_COLORS = {
  [TILE.WALL]: 0x1a1622,
  [TILE.FLOOR]: 0x2e2742,
  [TILE.DOOR]: 0xc9a84c,
  [TILE.WATER]: 0x2b4a6f,
  [TILE.GRASS]: 0x3b4a2a,
  [TILE.ROCK]: 0x4a4452,
  [TILE.SAND]: 0x8a7a4f,
};

export function colorFor(tile) {
  return TILE_COLORS[tile] ?? 0xff00ff;
}
