import { describe, it, expect } from "vitest";
import { TILE, WALKABLE } from "./tiles.js";
import {
  createMapModel,
  idx,
  inBounds,
  getTile,
  setTile,
} from "./MapModel.js";

describe("tiles", () => {
  it("define os tipos esperados", () => {
    expect(TILE.WALL).toBe(0);
    expect(TILE.FLOOR).toBe(1);
    expect(WALKABLE.has(TILE.FLOOR)).toBe(true);
    expect(WALKABLE.has(TILE.WALL)).toBe(false);
  });
});

describe("createMapModel", () => {
  it("cria um grid preenchido com WALL por padrão", () => {
    const m = createMapModel(4, 3);
    expect(m.w).toBe(4);
    expect(m.h).toBe(3);
    expect(m.tiles.length).toBe(12);
    expect(Array.from(m.tiles).every((t) => t === TILE.WALL)).toBe(true);
  });
});

describe("acesso a tiles", () => {
  it("idx mapeia (x,y) para o índice linear", () => {
    const m = createMapModel(4, 3);
    expect(idx(m, 0, 0)).toBe(0);
    expect(idx(m, 3, 2)).toBe(11);
  });

  it("inBounds detecta limites", () => {
    const m = createMapModel(4, 3);
    expect(inBounds(m, 0, 0)).toBe(true);
    expect(inBounds(m, 3, 2)).toBe(true);
    expect(inBounds(m, 4, 2)).toBe(false);
    expect(inBounds(m, -1, 0)).toBe(false);
  });

  it("get/set respeitam limites", () => {
    const m = createMapModel(4, 3);
    setTile(m, 1, 1, TILE.FLOOR);
    expect(getTile(m, 1, 1)).toBe(TILE.FLOOR);
    setTile(m, 99, 99, TILE.FLOOR); // no-op
    expect(getTile(m, 99, 99)).toBe(TILE.WALL); // fora = WALL
  });
});
