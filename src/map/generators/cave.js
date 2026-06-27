import { createMapModel, getTile, setTile, inBounds } from "../core/MapModel.js";
import { TILE } from "../core/tiles.js";

function wallsAround(m, x, y) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(m, nx, ny) || getTile(m, nx, ny) === TILE.WALL) count++;
    }
  }
  return count;
}

function step(m) {
  const next = createMapModel(m.w, m.h, TILE.WALL);
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      if (x === 0 || y === 0 || x === m.w - 1 || y === m.h - 1) {
        setTile(next, x, y, TILE.WALL);
        continue;
      }
      setTile(next, x, y, wallsAround(m, x, y) >= 5 ? TILE.WALL : TILE.FLOOR);
    }
  }
  return next;
}

export function generateCave(params, rng, seed) {
  const { width: w, height: h, options } = params;
  let m = createMapModel(w, h, TILE.WALL);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
        setTile(m, x, y, TILE.WALL);
      } else {
        setTile(m, x, y, rng() < options.fillProb ? TILE.WALL : TILE.FLOOR);
      }
    }
  }

  for (let s = 0; s < options.steps; s++) m = step(m);

  m.meta = { type: "cave", theme: params.theme };
  m.seed = seed;
  m.params = params;
  return m;
}
