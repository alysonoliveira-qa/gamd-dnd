import { describe, it, expect } from "vitest";
import { TILE } from "./tiles.js";
import { createMapModel, setTile } from "./MapModel.js";
import {
  floodFill,
  countWalkable,
  firstWalkable,
  isFullyConnected,
  keepLargestRegion,
} from "./connectivity.js";

// Mapa 5x1: FLOOR FLOOR WALL FLOOR FLOOR  → duas regiões
function twoRegions() {
  const m = createMapModel(5, 1);
  setTile(m, 0, 0, TILE.FLOOR);
  setTile(m, 1, 0, TILE.FLOOR);
  setTile(m, 3, 0, TILE.FLOOR);
  setTile(m, 4, 0, TILE.FLOOR);
  return m;
}

describe("floodFill", () => {
  it("alcança apenas células conexas", () => {
    const m = twoRegions();
    const mask = floodFill(m, 0, 0);
    let reached = 0;
    for (const v of mask) reached += v;
    expect(reached).toBe(2); // só a região da esquerda
  });
});

describe("countWalkable / firstWalkable", () => {
  it("conta e localiza tiles andáveis", () => {
    const m = twoRegions();
    expect(countWalkable(m)).toBe(4);
    expect(firstWalkable(m)).toEqual([0, 0]);
  });
});

describe("isFullyConnected", () => {
  it("é falso quando há regiões separadas", () => {
    expect(isFullyConnected(twoRegions())).toBe(false);
  });

  it("é verdadeiro para uma única região", () => {
    const m = createMapModel(3, 1);
    setTile(m, 0, 0, TILE.FLOOR);
    setTile(m, 1, 0, TILE.FLOOR);
    setTile(m, 2, 0, TILE.FLOOR);
    expect(isFullyConnected(m)).toBe(true);
  });
});

describe("keepLargestRegion", () => {
  it("mantém a maior região e remove o resto", () => {
    // esquerda tem 2, direita tem 2 — empate resolvido pela primeira encontrada;
    // tornamos a direita maior para um teste determinístico:
    const m = createMapModel(6, 1);
    setTile(m, 0, 0, TILE.FLOOR); // região A (1)
    setTile(m, 2, 0, TILE.FLOOR); // região B
    setTile(m, 3, 0, TILE.FLOOR); // região B
    setTile(m, 4, 0, TILE.FLOOR); // região B (3)
    keepLargestRegion(m);
    expect(isFullyConnected(m)).toBe(true);
    expect(countWalkable(m)).toBe(3);
  });
});
