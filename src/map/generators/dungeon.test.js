import { describe, it, expect } from "vitest";
import { makeRng } from "../core/rng.js";
import { validateMapRequest } from "../schema/mapRequest.js";
import { generateDungeon } from "./dungeon.js";
import { TILE } from "../core/tiles.js";

function gen(seed) {
  const params = validateMapRequest({ type: "dungeon", width: 48, height: 32, seed });
  return generateDungeon(params, makeRng(seed), seed);
}

describe("generateDungeon", () => {
  it("é determinística para a mesma seed", () => {
    const a = gen(123);
    const b = gen(123);
    expect(Array.from(a.tiles)).toEqual(Array.from(b.tiles));
  });

  it("produz pelo menos uma sala e algum piso", () => {
    const m = gen(123);
    expect(m.rooms.length).toBeGreaterThan(0);
    const floors = Array.from(m.tiles).filter((t) => t === TILE.FLOOR).length;
    expect(floors).toBeGreaterThan(0);
  });

  it("grava metadados e seed", () => {
    const m = gen(123);
    expect(m.meta.type).toBe("dungeon");
    expect(m.seed).toBe(123);
  });
});
