import { createNoise2D } from "simplex-noise";
import { createMapModel, setTile } from "../core/MapModel.js";
import { TILE } from "../core/tiles.js";

export function generateWilderness(params, rng, seed) {
  const { width: w, height: h, options } = params;
  const m = createMapModel(w, h, TILE.GRASS);
  const noise2D = createNoise2D(rng);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const e = (noise2D(x * options.scale, y * options.scale) + 1) / 2; // 0..1
      let t;
      if (e < options.waterLevel) t = TILE.WATER;
      else if (e < options.waterLevel + 0.08) t = TILE.SAND;
      else if (e > 0.8) t = TILE.ROCK;
      else t = TILE.GRASS;
      setTile(m, x, y, t);
    }
  }

  m.meta = { type: "wilderness", theme: params.theme };
  m.seed = seed;
  m.params = params;
  return m;
}
