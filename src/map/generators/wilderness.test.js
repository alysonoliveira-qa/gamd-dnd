import { describe, it, expect } from "vitest";
import { makeRng } from "../core/rng.js";
import { validateMapRequest } from "../schema/mapRequest.js";
import { generateWilderness } from "./wilderness.js";
import { TILE } from "../core/tiles.js";

function gen(seed) {
  const params = validateMapRequest({ type: "wilderness", width: 40, height: 30, seed });
  return generateWilderness(params, makeRng(seed), seed);
}

describe("generateWilderness", () => {
  it("é determinística para a mesma seed", () => {
    expect(Array.from(gen(5).tiles)).toEqual(Array.from(gen(5).tiles));
  });

  it("usa tiles de terreno externo (grass/water/sand/rock)", () => {
    const m = gen(5);
    const set = new Set(Array.from(m.tiles));
    const outdoor = [TILE.GRASS, TILE.WATER, TILE.SAND, TILE.ROCK];
    expect(outdoor.some((t) => set.has(t))).toBe(true);
  });

  it("grava metadados de wilderness", () => {
    expect(gen(5).meta.type).toBe("wilderness");
  });
});
