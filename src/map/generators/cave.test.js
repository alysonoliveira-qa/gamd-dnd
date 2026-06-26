import { describe, it, expect } from "vitest";
import { makeRng } from "../core/rng.js";
import { validateMapRequest } from "../schema/mapRequest.js";
import { generateCave } from "./cave.js";
import { TILE } from "../core/tiles.js";

function gen(seed) {
  const params = validateMapRequest({ type: "cave", width: 40, height: 30, seed });
  return generateCave(params, makeRng(seed), seed);
}

describe("generateCave", () => {
  it("é determinística para a mesma seed", () => {
    expect(Array.from(gen(9).tiles)).toEqual(Array.from(gen(9).tiles));
  });

  it("produz uma mistura de piso e parede", () => {
    const m = gen(9);
    const floors = Array.from(m.tiles).filter((t) => t === TILE.FLOOR).length;
    const walls = Array.from(m.tiles).filter((t) => t === TILE.WALL).length;
    expect(floors).toBeGreaterThan(0);
    expect(walls).toBeGreaterThan(0);
  });

  it("mantém as bordas como parede", () => {
    const m = gen(9);
    expect(m.tiles[0]).toBe(TILE.WALL);
    expect(m.tiles[m.w - 1]).toBe(TILE.WALL);
  });
});
